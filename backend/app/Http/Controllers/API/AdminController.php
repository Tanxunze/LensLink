<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Review;
use App\Models\Message;
use App\Models\BanList;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Report;

class AdminController extends Controller
{
    public function checkAuth(Request $request)
    {
        $user = Auth::user();

        if ($user && $user->role === 'admin') {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 403);
    }

    public function getStats(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $pendingReports = DB::table('reports')->where('status', 'pending')->count();
        $totalUsers = User::count();
        $totalPhotographers = User::where('role', 'photographer')->count();
        $reportedComments = Review::where('is_published', 0)->count();
        $bannedUsers = BanList::where(function($query) {
            $query->whereNull('expires_at')
                ->orWhere('expires_at', '>', Carbon::now());
        })->count();

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed dashboard statistics',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'totalUsers' => $totalUsers,
                'totalPhotographers' => $totalPhotographers,
                'reportedComments' => $reportedComments,
                'bannedUsers' => $bannedUsers,
                'pendingReports' => $pendingReports
            ]
        ]);
    }

    public function getUsers(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = User::query();

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $totalUsers = $query->count();
        $lastPage = ceil($totalUsers / $perPage);

        $users = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Check if users are banned
        foreach ($users as $user) {
            $ban = BanList::where('user_id', $user->id)
                ->where(function($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', Carbon::now());
                })
                ->first();

            $user->banned = $ban ? true : false;
        }

        return response()->json([
            'success' => true,
            'data' => $users,
            'meta' => [
                'total' => $totalUsers,
                'per_page' => $perPage,
                'current_page' => $page,
                'lastPage' => $lastPage
            ]
        ]);
    }

    public function getUserDetails(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $targetUser = User::with(['photographerProfile'])->find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Check if user is banned
        $ban = BanList::where('user_id', $targetUser->id)
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->first();

        $targetUser->banned = $ban ? true : false;

        if ($ban) {
            $targetUser->ban_details = [
                'reason' => $ban->reason,
                'duration' => $ban->duration,
                'expires_at' => $ban->expires_at,
                'created_at' => $ban->created_at
            ];
        }

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed user #' . $id . ' details',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => $targetUser
        ]);
    }

    public function banUser(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string',
            'duration' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $targetUser = User::find($request->user_id);

        if ($targetUser->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot ban an admin user'
            ], 422);
        }

        $duration = (int) $request->duration;
        $expiresAt = null;
        if ($duration > 0) {
            $expiresAt = Carbon::now()->addDays($duration);
        }

        // Create or update ban
        $ban = BanList::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'reason' => $request->reason,
                'duration' => $request->duration,
                'expires_at' => $expiresAt,
                'banned_by' => $user->id
            ]
        );

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Banned user #' . $request->user_id,
            'ip_address' => $request->ip(),
            'details' => json_encode([
                'reason' => $request->reason,
                'duration' => $request->duration
            ])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User has been banned successfully',
            'data' => $ban
        ]);
    }

    public function unbanUser(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $ban = BanList::find($id);

        if (!$ban) {
            return response()->json([
                'success' => false,
                'message' => 'Ban record not found'
            ], 404);
        }

        $bannedUserId = $ban->user_id;
        $ban->delete();

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Unbanned user #' . $bannedUserId,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User has been unbanned successfully'
        ]);
    }

    public function getBanList(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = BanList::with('user', 'admin');

        if (!empty($search)) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $totalBans = $query->count();
        $lastPage = ceil($totalBans / $perPage);

        $bans = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Format data
        $formattedBans = $bans->map(function($ban) {
            return [
                'id' => $ban->id,
                'user_id' => $ban->user_id,
                'user_name' => $ban->user->name,
                'user_email' => $ban->user->email,
                'reason' => $ban->reason,
                'duration' => $ban->duration,
                'expires_at' => $ban->expires_at,
                'banned_by' => $ban->admin->name,
                'created_at' => $ban->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedBans,
            'meta' => [
                'total' => $totalBans,
                'per_page' => $perPage,
                'current_page' => $page,
                'lastPage' => $lastPage
            ]
        ]);
    }

    public function getComments(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = Review::with('customer', 'photographer.user');

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('review', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhereHas('customer', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $totalComments = $query->count();
        $lastPage = ceil($totalComments / $perPage);

        $comments = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Format data
        $formattedComments = $comments->map(function($comment) {
            return [
                'id' => $comment->id,
                'user_id' => $comment->customer_id,
                'user_name' => $comment->customer->name,
                'photographer_id' => $comment->photographer_id,
                'photographer_name' => $comment->photographer->user->name,
                'rating' => $comment->rating,
                'title' => $comment->title,
                'content' => $comment->review,
                'is_published' => $comment->is_published,
                'created_at' => $comment->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedComments,
            'meta' => [
                'total' => $totalComments,
                'per_page' => $perPage,
                'current_page' => $page,
                'lastPage' => $lastPage
            ]
        ]);
    }

    public function deleteComment(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $comment = Review::find($id);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found'
            ], 404);
        }

        $comment->delete();

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Deleted comment #' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment has been deleted successfully'
        ]);
    }

    public function toggleCommentVisibility(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_published' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $comment = Review::find($id);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found'
            ], 404);
        }

        $comment->is_published = $request->is_published;
        $comment->save();

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => $request->is_published ? 'Published comment #' . $id : 'Unpublished comment #' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => $request->is_published ? 'Comment has been published' : 'Comment has been unpublished',
            'data' => $comment
        ]);
    }

    public function getCommentDetails(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $comment = Review::with(['customer', 'photographer.user'])->find($id);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found'
            ], 404);
        }

        $responseData = [
            'id' => $comment->id,
            'user_id' => $comment->customer_id,
            'user_name' => $comment->customer->name,
            'photographer_id' => $comment->photographer_id,
            'photographer_name' => $comment->photographer->user->name,
            'rating' => $comment->rating,
            'title' => $comment->title,
            'content' => $comment->review,
            'service_type' => $comment->service_type,
            'service_date' => $comment->service_date,
            'reply' => $comment->reply,
            'reply_date' => $comment->reply_date,
            'is_published' => $comment->is_published,
            'created_at' => $comment->created_at,
            'updated_at' => $comment->updated_at
        ];

        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed comment #' . $id . ' details',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }

    public function getMessages(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = Message::with('sender', 'conversation.participants.user');

        if (!empty($search)) {
            $query->where('message', 'like', "%{$search}%")
                ->orWhereHas('sender', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $totalMessages = $query->count();
        $lastPage = ceil($totalMessages / $perPage);

        $messages = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Format data
        $formattedMessages = $messages->map(function($message) {
            // Find recipient
            $recipientIds = $message->conversation->participants
                ->where('user_id', '!=', $message->sender_id)
                ->pluck('user_id');

            $recipientNames = User::whereIn('id', $recipientIds)
                ->pluck('name')
                ->implode(', ');

            return [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'recipient_name' => $recipientNames,
                'content' => $message->message,
                'created_at' => $message->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedMessages,
            'meta' => [
                'total' => $totalMessages,
                'per_page' => $perPage,
                'current_page' => $page,
                'lastPage' => $lastPage
            ]
        ]);
    }

    public function getMessageDetails(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $message = Message::with(['sender', 'conversation'])->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        $participants = DB::table('conversation_participants as cp')
            ->join('users as u', 'cp.user_id', '=', 'u.id')
            ->where('cp.conversation_id', $message->conversation_id)
            ->select('u.id as user_id', 'u.name')
            ->get();

        $recipients = collect($participants)->filter(function($participant) use ($message) {
            return $participant->user_id != $message->sender_id;
        })->map(function($participant) {
            return [
                'id' => $participant->user_id,
                'name' => $participant->name
            ];
        });

        $conversationMessages = Message::with('sender')
            ->where('conversation_id', $message->conversation_id)
            ->orderBy('created_at', 'asc')
            ->take(10)
            ->get()
            ->map(function($msg) {
                return [
                    'id' => $msg->id,
                    'sender_id' => $msg->sender_id,
                    'sender_name' => $msg->sender->name,
                    'content' => $msg->message,
                    'created_at' => $msg->created_at
                ];
            });

        $responseData = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'conversation_subject' => $message->conversation->subject,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'recipient_name' => $recipients->pluck('name')->implode(', '),
            'recipients' => $recipients->toArray(),
            'content' => $message->message,
            'created_at' => $message->created_at,
            'updated_at' => $message->updated_at,
            'conversation' => [
                'id' => $message->conversation_id,
                'subject' => $message->conversation->subject,
                'messages' => $conversationMessages
            ]
        ];

        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed message #' . $id . ' details',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }

    public function deleteMessage(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $message = Message::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        $message->delete();

        // Log admin activity
        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Deleted message #' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message has been deleted successfully'
        ]);
    }

    public function getLogs(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = SystemLog::with('user');

        $totalLogs = $query->count();
        $lastPage = ceil($totalLogs / $perPage);

        $logs = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Format data
        $formattedLogs = $logs->map(function($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user_name' => $log->user ? $log->user->name : 'System',
                'type' => $log->type,
                'action' => $log->action,
                'ip_address' => $log->ip_address,
                'details' => $log->details,
                'created_at' => $log->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedLogs,
            'meta' => [
                'total' => $totalLogs,
                'per_page' => $perPage,
                'current_page' => $page,
                'lastPage' => $lastPage
            ]
        ]);
    }

    public function getLogDetails(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $log = SystemLog::with('user')->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log not found'
            ], 404);
        }

        $responseData = [
            'id' => $log->id,
            'type' => $log->type,
            'action' => $log->action,
            'ip_address' => $log->ip_address,
            'details' => $log->details,
            'user_id' => $log->user_id,
            'user_name' => $log->user ? $log->user->name : null,
            'created_at' => $log->created_at,
            'updated_at' => $log->updated_at
        ];

        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed system log #' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }

    public function clearLogs(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $countDeleted = SystemLog::count();

            SystemLog::create([
                'user_id' => $user->id,
                'type' => 'admin',
                'action' => 'Cleared all system logs',
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'logs_deleted' => $countDeleted
                ])
            ]);

            $latestLog = SystemLog::latest()->first();
            SystemLog::where('id', '!=', $latestLog->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'System logs cleared successfully',
                'count_deleted' => $countDeleted
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear system logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getRecentActivities(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $logs = SystemLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Format data
        $formattedLogs = $logs->map(function($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? $log->user->name : 'System',
                'action' => $log->action,
                'timestamp' => $log->created_at,
                'status' => 'Completed'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedLogs
        ]);
    }

    public function getBanDetails(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $ban = BanList::with(['user', 'admin'])->find($id);

        if (!$ban) {
            return response()->json([
                'success' => false,
                'message' => 'Ban record not found'
            ], 404);
        }

        $responseData = [
            'id' => $ban->id,
            'user_id' => $ban->user_id,
            'user_name' => $ban->user->name,
            'reason' => $ban->reason,
            'duration' => $ban->duration,
            'expires_at' => $ban->expires_at,
            'banned_by' => $ban->admin->name,
            'created_at' => $ban->created_at,
            'updated_at' => $ban->updated_at,
            'user_details' => [
                'id' => $ban->user->id,
                'name' => $ban->user->name,
                'email' => $ban->user->email,
                'role' => $ban->user->role,
                'created_at' => $ban->user->created_at
            ]
        ];

        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed ban record #' . $id . ' details',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }


    public function getReports(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = DB::table('reports')
            ->join('users as reported_users', 'reports.user_id', '=', 'reported_users.id')
            ->join('users as reporters', 'reports.reporter_id', '=', 'reporters.id')
            ->leftJoin('users as admins', 'reports.resolved_by', '=', 'admins.id')
            ->select(
                'reports.*',
                'reported_users.name as reported_user_name',
                'reporters.name as reporter_name',
                'admins.name as resolved_by_name'
            );

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('reports.reason', 'like', "%{$search}%")
                    ->orWhere('reported_users.name', 'like', "%{$search}%")
                    ->orWhere('reporters.name', 'like', "%{$search}%");
            });
        }

        $totalReports = $query->count();
        $lastPage = ceil($totalReports / $perPage);

        $reports = $query->orderBy('reports.created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports,
            'meta' => [
                'total' => $totalReports,
                'per_page' => $perPage,
                'current_page' => $page,
                'lastPage' => $lastPage
            ]
        ]);
    }


    public function getReportDetails(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $report = DB::table('reports')
            ->join('users as reported_users', 'reports.user_id', '=', 'reported_users.id')
            ->join('users as reporters', 'reports.reporter_id', '=', 'reporters.id')
            ->leftJoin('users as admins', 'reports.resolved_by', '=', 'admins.id')
            ->select(
                'reports.*',
                'reported_users.name as reported_user_name',
                'reporters.name as reporter_name',
                'admins.name as resolved_by_name'
            )
            ->where('reports.id', $id)
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found'
            ], 404);
        }


        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'admin',
            'action' => 'Viewed report #' . $id . ' details',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }


    public function handleReport(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'report_id' => 'required|exists:reports,id',
            'status' => 'required|in:processing,resolved,rejected',
            'admin_notes' => 'nullable|string',
            'ban_user' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $report = DB::table('reports')->where('id', $request->report_id)->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report not found'
                ], 404);
            }


            DB::table('reports')
                ->where('id', $request->report_id)
                ->update([
                    'status' => $request->status,
                    'resolved_by' => $user->id,
                    'resolved_at' => now(),
                    'admin_notes' => $request->admin_notes,
                    'updated_at' => now()
                ]);


            if ($request->ban_user) {
                $duration = (int) $request->ban_duration;
                $expiresAt = null;

                if ($duration > 0) {
                    $expiresAt = Carbon::now()->addDays($duration);
                }


                BanList::updateOrCreate(
                    ['user_id' => $report->user_id],
                    [
                        'reason' => 'Banned due to user report: ' . ($request->admin_notes ?: 'No additional notes'),
                        'duration' => $request->ban_duration,
                        'expires_at' => $expiresAt,
                        'banned_by' => $user->id
                    ]
                );
            }

            DB::commit();


            SystemLog::create([
                'user_id' => $user->id,
                'type' => 'admin',
                'action' => 'Handled report #' . $request->report_id,
                'ip_address' => $request->ip(),
                'details' => json_encode([
                    'status' => $request->status,
                    'ban_user' => $request->ban_user,
                    'ban_duration' => $request->ban_duration ?? null
                ])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Report has been handled successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to handle report: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createReport(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $report = new \App\Models\Report([
            'user_id' => $request->user_id,
            'reporter_id' => $user->id,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        $report->save();

        return response()->json([
            'success' => true,
            'message' => 'Report submitted successfully',
            'data' => $report
        ]);
    }
}
