<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CustomerMessageController extends Controller
{
    /**
     * Send contact request to another customer
     */
    public function sendRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sender_id = Auth::id();
        $recipient_id = $request->recipient_id;

        // Check if sender is a customer
        $senderRole = DB::table('users')->where('id', $sender_id)->value('role');
        if ($senderRole !== 'customer') {
            return response()->json(['error' => 'Only customers can send contact requests'], 403);
        }

        // Check if recipient is a customer
        $recipientRole = DB::table('users')->where('id', $recipient_id)->value('role');
        if ($recipientRole !== 'customer') {
            return response()->json(['error' => 'Recipient is not a customer'], 400);
        }

        // Check if trying to contact yourself
        if ($sender_id == $recipient_id) {
            return response()->json(['error' => 'Cannot send contact request to yourself'], 400);
        }

        // Check if already connected or request pending
        $existingRequest = DB::table('contact_requests')
            ->where(function($query) use ($sender_id, $recipient_id) {
                $query->where('sender_id', $sender_id)
                    ->where('recipient_id', $recipient_id);
            })
            ->orWhere(function($query) use ($sender_id, $recipient_id) {
                $query->where('sender_id', $recipient_id)
                    ->where('recipient_id', $sender_id);
            })
            ->first();

        if ($existingRequest) {
            if ($existingRequest->status === 'accepted') {
                return response()->json(['error' => 'You are already connected with this user'], 400);
            } else if ($existingRequest->status === 'pending' && $existingRequest->sender_id == $sender_id) {
                return response()->json(['error' => 'You already have a pending request to this user'], 400);
            } else if ($existingRequest->status === 'pending' && $existingRequest->recipient_id == $sender_id) {
                // Auto-accept if other party already sent a request
                DB::table('contact_requests')
                    ->where('id', $existingRequest->id)
                    ->update(['status' => 'accepted', 'updated_at' => Carbon::now()]);

                // Create a conversation
                $conversation_id = DB::table('customer_conversations')->insertGetId([
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);

                // Add participants
                DB::table('customer_conversation_participants')->insert([
                    ['conversation_id' => $conversation_id, 'user_id' => $sender_id],
                    ['conversation_id' => $conversation_id, 'user_id' => $recipient_id]
                ]);

                return response()->json([
                    'message' => 'Request automatically accepted as recipient already sent you a request',
                    'conversation_id' => $conversation_id
                ]);
            }
        }

        // Insert new request
        $requestId = DB::table('contact_requests')->insertGetId([
            'sender_id' => $sender_id,
            'recipient_id' => $recipient_id,
            'message' => $request->message,
            'status' => 'pending',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Contact request sent successfully',
            'request_id' => $requestId
        ]);
    }

    /**
     * Get pending contact requests
     */
    public function getPendingRequests()
    {
        $user_id = Auth::id();

        $pendingRequests = DB::table('contact_requests')
            ->join('users as senders', 'contact_requests.sender_id', '=', 'senders.id')
            ->select(
                'contact_requests.id',
                'contact_requests.sender_id',
                'senders.name as sender_name',
                'contact_requests.message',
                'contact_requests.created_at'
            )
            ->where('contact_requests.recipient_id', $user_id)
            ->where('contact_requests.status', 'pending')
            ->orderBy('contact_requests.created_at', 'desc')
            ->get();

        return response()->json([
            'pending_requests' => $pendingRequests
        ]);
    }

    public function getPendingRequestsCount()
    {
        $user_id = Auth::id();

        $count = DB::table('contact_requests')
            ->where('recipient_id', $user_id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'count' => $count
        ]);
    }
    /**
     * Accept contact request
     */
    public function acceptRequest($requestId)
    {
        $user_id = Auth::id();

        $request = DB::table('contact_requests')
            ->where('id', $requestId)
            ->where('recipient_id', $user_id)
            ->where('status', 'pending')
            ->first();

        if (!$request) {
            return response()->json(['error' => 'Request not found or already processed'], 404);
        }

        // Update request status
        DB::table('contact_requests')
            ->where('id', $requestId)
            ->update(['status' => 'accepted', 'updated_at' => Carbon::now()]);

        // Create a conversation
        $conversation_id = DB::table('customer_conversations')->insertGetId([
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Add participants
        DB::table('customer_conversation_participants')->insert([
            ['conversation_id' => $conversation_id, 'user_id' => $user_id],
            ['conversation_id' => $conversation_id, 'user_id' => $request->sender_id]
        ]);

        if (!empty($request->message)) {
            DB::table('customer_messages')->insert([
                'conversation_id' => $conversation_id,
                'sender_id' => $request->sender_id,
                'message' => $request->message,
                'is_read' => true,
                'created_at' => $request->created_at,
                'updated_at' => Carbon::now(),
            ]);
        }

        return response()->json([
            'message' => 'Contact request accepted',
            'conversation_id' => $conversation_id
        ]);
    }

    /**
     * Reject contact request
     */
    public function rejectRequest($requestId)
    {
        $user_id = Auth::id();

        $updated = DB::table('contact_requests')
            ->where('id', $requestId)
            ->where('recipient_id', $user_id)
            ->where('status', 'pending')
            ->update(['status' => 'rejected', 'updated_at' => Carbon::now()]);

        if (!$updated) {
            return response()->json(['error' => 'Request not found or already processed'], 404);
        }

        return response()->json(['message' => 'Contact request rejected']);
    }

    /**
     * Get customer conversations
     */
    public function getConversations()
    {
        $user_id = Auth::id();

        // Get all conversations user is part of
        $conversationIds = DB::table('customer_conversation_participants')
            ->where('user_id', $user_id)
            ->pluck('conversation_id');

        $conversations = [];

        foreach ($conversationIds as $conversation_id) {
            // Get other participant
            $otherParticipant = DB::table('customer_conversation_participants')
                ->join('users', 'customer_conversation_participants.user_id', '=', 'users.id')
                ->select('users.id', 'users.name', 'users.profile_image')
                ->where('customer_conversation_participants.conversation_id', $conversation_id)
                ->where('customer_conversation_participants.user_id', '!=', $user_id)
                ->first();

            // Get latest message
            $latestMessage = DB::table('customer_messages')
                ->where('conversation_id', $conversation_id)
                ->orderBy('created_at', 'desc')
                ->first();

            // Get unread count
            $unreadCount = DB::table('customer_messages')
                ->where('conversation_id', $conversation_id)
                ->where('sender_id', '!=', $user_id)
                ->where('is_read', 0)
                ->count();

            $conversations[] = [
                'conversation_id' => $conversation_id,
                'participant' => $otherParticipant,
                'latest_message' => $latestMessage ? [
                    'content' => $latestMessage->message,
                    'time' => $latestMessage->created_at,
                    'is_mine' => $latestMessage->sender_id == $user_id
                ] : null,
                'unread_count' => $unreadCount
            ];
        }

        // Sort by latest message time
        usort($conversations, function($a, $b) {
            if (!$a['latest_message'] && !$b['latest_message']) return 0;
            if (!$a['latest_message']) return 1;
            if (!$b['latest_message']) return -1;

            return strtotime($b['latest_message']['time']) - strtotime($a['latest_message']['time']);
        });

        return response()->json(['conversations' => $conversations]);
    }

    /**
     * Get messages for a conversation
     */
    public function getConversationMessages($conversationId)
    {
        $user_id = Auth::id();

        // Check if user is part of conversation
        $isParticipant = DB::table('customer_conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $user_id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get other participant
        $otherParticipant = DB::table('customer_conversation_participants')
            ->join('users', 'customer_conversation_participants.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.profile_image')
            ->where('customer_conversation_participants.conversation_id', $conversationId)
            ->where('customer_conversation_participants.user_id', '!=', $user_id)
            ->first();

        // Get messages
        $messages = DB::table('customer_messages')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($message) use ($user_id) {
                return [
                    'id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'message' => $message->message,
                    'created_at' => $message->created_at,
                    'is_mine' => $message->sender_id == $user_id,
                    'is_read' => $message->is_read
                ];
            });

        // Mark messages as read
        DB::table('customer_messages')
            ->where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user_id)
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        return response()->json([
            'conversation_id' => $conversationId,
            'participant' => $otherParticipant,
            'messages' => $messages
        ]);
    }

    /**
     * Send message in a conversation
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|exists:customer_conversations,id',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user_id = Auth::id();
        $conversation_id = $request->conversation_id;

        // Check if user is part of conversation
        $isParticipant = DB::table('customer_conversation_participants')
            ->where('conversation_id', $conversation_id)
            ->where('user_id', $user_id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Insert message
        $messageId = DB::table('customer_messages')->insertGetId([
            'conversation_id' => $conversation_id,
            'sender_id' => $user_id,
            'message' => $request->message,
            'is_read' => 0,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Update conversation last updated
        DB::table('customer_conversations')
            ->where('id', $conversation_id)
            ->update(['updated_at' => Carbon::now()]);

        return response()->json([
            'message' => 'Message sent successfully',
            'message_id' => $messageId,
            'sent_at' => Carbon::now()
        ]);
    }
}
