<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Comment;
use App\Models\SystemLog;
use Illuminate\Support\Carbon;

class AdminController extends Controller
{
    // Dashboard Statistic information
    public function getStats()
    {
        $totalUsers = User::count();
        $totalPhotographers = User::where('role', 'photographer')->count();
        $pendingApprovals = User::where('status', 'pending')->count();
        $revenue = 15700; // 假数据

        return response()->json([
            'total_users' => $totalUsers,
            'total_photographers' => $totalPhotographers,
            'pending_approvals' => $pendingApprovals,
            'revenue' => $revenue,
        ]);
    }

    // Latest Registered Users
    public function getRecentUsers()
    {
        $users = User::orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at', 'status']);

        return response()->json($users);
    }

    // System Log
    public function getLogs()
    {
        $logs = SystemLog::orderBy('created_at', 'desc')
            ->take(10)
            ->get(['id', 'action', 'admin_name', 'created_at']);

        return response()->json($logs);
    }

    // Get a list of comments
    public function getComments()
    {
        $comments = Comment::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get(['id', 'user_id', 'content', 'created_at']);

        $formatted = $comments->map(function ($comment) {
            return [
                'id' => $comment->id,
                'user' => $comment->user->name ?? 'Unknown',
                'comment' => $comment->content,
            ];
        });

        return response()->json($formatted);
    }

    // Delete comment
    public function deleteComment($id)
    {
        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['message' => 'Comment not found.'], 404);
        }

        $comment->delete();
        return response()->json(['message' => "Comment $id deleted."], 200);
    }

    // user bans
    public function banUser($id, Request $request)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $duration = $request->input('duration');
        $banUntil = match ($duration) {
            '24H' => Carbon::now()->addDay(),
            '7D' => Carbon::now()->addDays(7),
            'Permanent' => null,
            default => null,
        };

        $user->banned_until = $banUntil;
        $user->is_banned = $duration === 'Permanent';
        $user->save();

        return response()->json([
            'message' => "User {$user->name} has been banned for $duration."
        ]);
    }
}
