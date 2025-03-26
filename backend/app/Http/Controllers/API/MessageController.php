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
        $query = Conversation::with(['photographer', 'customer']);

        if ($user->role === 'photographer') {
            $query->where('photographer_id', $user->photographerProfile->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        $conversations = $query->orderBy('updated_at', 'desc')->get();

        foreach ($conversations as $conversation) {
            $unreadCount = Message::where('conversation_id', $conversation->id)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();

            $conversation->unread_count = $unreadCount;
        }

        return response()->json($conversations);
    }

    public function getConversationMessages($id, Request $request)
    {
        $conversation = Conversation::findOrFail($id);
        $user = Auth::user();

        if (($user->role === 'photographer' && $user->photographerProfile->id != $conversation->photographer_id) ||
            ($user->role === 'customer' && $user->id != $conversation->customer_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
        $conversation = Conversation::findOrFail($request->conversation_id);

        if (($user->role === 'photographer' && $user->photographerProfile->id != $conversation->photographer_id) ||
            ($user->role === 'customer' && $user->id != $conversation->customer_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
}
