<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        // Add unread count for each conversation
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

        // Check if user has access to this conversation
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
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $user = Auth::user();

        // Find or create conversation
        $conversation = Conversation::firstOrCreate(
            [
                'photographer_id' => $request->photographer_id,
                'customer_id' => $user->id
            ],
            ['subject' => $request->subject]
        );

        // Create message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $request->message,
            'is_read' => false
        ]);

        // Update conversation last updated timestamp
        $conversation->touch();

        return response()->json([
            'conversation' => $conversation,
            'message' => $message
        ], 201);
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id'
        ]);

        $user = Auth::user();
        $conversation = Conversation::findOrFail($request->conversation_id);

        // Check if user has access to this conversation
        if (($user->role === 'photographer' && $user->photographerProfile->id != $conversation->photographer_id) ||
            ($user->role === 'customer' && $user->id != $conversation->customer_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Mark all messages from the other user as read
        Message::where('conversation_id', $request->conversation_id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Messages marked as read']);
    }
}
