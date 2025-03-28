<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\PhotographerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function getConversations()
    {
        $user = Auth::user();
        $participatedConversationIds = DB::table('conversation_participants')
            ->where('user_id', $user->id)
            ->pluck('conversation_id');

        $conversations = Conversation::whereIn('id', $participatedConversationIds)
            ->with(['participants.user'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $result = [];

        foreach ($conversations as $conversation) {
            $otherParticipants = DB::table('conversation_participants AS cp')
                ->join('users AS u', 'cp.user_id', '=', 'u.id')
                ->leftJoin('photographer_profiles AS pp', 'u.id', '=', 'pp.user_id')
                ->where('cp.conversation_id', $conversation->id)
                ->where('cp.user_id', '!=', $user->id)
                ->select('u.id', 'u.name', 'u.email', 'u.profile_image', 'pp.id AS photographer_id')
                ->first();

            $lastMessage = Message::where('conversation_id', $conversation->id)
                ->orderBy('created_at', 'desc')
                ->first();

            $unreadCount = Message::where('conversation_id', $conversation->id)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();

            $formattedConversation = [
                'id' => $conversation->id,
                'subject' => $conversation->subject,
                'last_message' => $lastMessage ? $lastMessage->message : null,
                'last_message_time' => $lastMessage ? $lastMessage->created_at : $conversation->created_at,
                'unread_count' => $unreadCount,
                'updated_at' => $conversation->updated_at,
                'created_at' => $conversation->created_at
            ];

            if ($otherParticipants) {
                if ($user->role === 'customer') {
                    $formattedConversation['photographer'] = [
                        'id' => $otherParticipants->photographer_id,
                        'user' => [
                            'id' => $otherParticipants->id,
                            'name' => $otherParticipants->name,
                            'email' => $otherParticipants->email,
                            'profile_image' => $otherParticipants->profile_image
                        ]
                    ];
                } else {
                    $formattedConversation['customer'] = [
                        'id' => $otherParticipants->id,
                        'name' => $otherParticipants->name,
                        'email' => $otherParticipants->email,
                        'profile_image' => $otherParticipants->profile_image
                    ];
                }
            }

            $result[] = $formattedConversation;
        }

        return response()->json($result);
    }

    public function getConversationMessages($id, Request $request)
    {
        $messages = Message::where('conversation_id', $id)
            ->with('sender')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photographer_id' => 'required|exists:photographer_profiles,id',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string'
        ]);

        $user = Auth::user();

        $photographer = PhotographerProfile::findOrFail($request->photographer_id);
        $photographerUserId = $photographer->user_id;

        DB::beginTransaction();

        try {
            $existingConversation = DB::table('conversations')
                ->join('conversation_participants as p1', 'p1.conversation_id', '=', 'conversations.id')
                ->join('conversation_participants as p2', 'p2.conversation_id', '=', 'conversations.id')
                ->where('p1.user_id', $user->id)
                ->where('p2.user_id', $photographerUserId)
                ->select('conversations.id')
                ->first();

            if ($existingConversation) {
                $conversationId = $existingConversation->id;
            } else {
                $conversationId = DB::table('conversations')->insertGetId([
                    'subject' => $request->subject ?? 'Conversation with photographer',
                    'booking_id' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                DB::table('conversation_participants')->insert([
                    [
                        'conversation_id' => $conversationId,
                        'user_id' => $user->id,
                        'last_read_at' => now(),
                        'created_at' => now()
                    ],
                    [
                        'conversation_id' => $conversationId,
                        'user_id' => $photographerUserId,
                        'last_read_at' => null,
                        'created_at' => now()
                    ]
                ]);
            }

            $messageData = [
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'message' => $request->message,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $messageId = DB::table('messages')->insertGetId($messageData);

            DB::table('conversations')
                ->where('id', $conversationId)
                ->update(['updated_at' => now()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'conversation_id' => $conversationId,
                'message_id' => $messageId
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id'
        ]);

        $user = Auth::user();

        Message::where('conversation_id', $request->conversation_id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Messages marked as read']);
    }

    public function count(Request $request)
    {
        $user = Auth::user();

        $participatedConversations = DB::table('conversation_participants')
            ->where('user_id', $user->id)
            ->pluck('conversation_id');

        $query = Message::whereIn('conversation_id', $participatedConversations)
            ->where('sender_id', '!=', $user->id);

        if ($request->has('unread') && $request->unread === 'true') {
            $query->where('is_read', false);
        }

        $count = $query->count();

        return response()->json(['count' => $count]);
    }

    public function replyToConversation(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string'
        ]);

        $user = Auth::user();
        $conversationId = $request->conversation_id;

        $isParticipant = DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = new Message([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'message' => $request->message,
            'is_read' => false
        ]);
        $message->save();

        DB::table('conversations')
            ->where('id', $conversationId)
            ->update(['updated_at' => now()]);

        return response()->json([
            'success' => true,
            'message_id' => $message->id
        ], 201);
    }
}
