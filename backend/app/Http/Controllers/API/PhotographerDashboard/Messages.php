<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\PhotographerProfile;
use App\Models\User;
use Dotenv\Validator;
use Illuminate\Http\Request;

class Messages extends Controller
{
//    public function index()
//    {
//        $p_id = request()->user()->photographerProfile->id;
//        $booking_ids = Booking::where('photographer_id', $p_id)->pluck('id');
//        $result = [];
//        $result['user_id'] = PhotographerProfile::where('id', $p_id)->value('user_id');
//        $result['booking_ids'] = $booking_ids;//Debug
//        $result['conversations'] = [];
//        $cached_username = [];
//        foreach ($booking_ids as $booking_id) {
//            $data = [];
//            $conversation_id = Conversation::where('booking_id', $booking_id)->value('id');
//            $message = Message::where('conversation_id', $conversation_id)
//                ->orderBy('created_at', 'asc')
//                ->get();
//            $data['conversation_id'] = $conversation_id;
//            $messages_final = [];
//            foreach ($message as $msg) {
//                $user_id = $msg->sender_id;
//                if (!isset($cached_username[$user_id])) {
//                    $username = User::where('id', $user_id)->value('name');
//                    $cached_username[$user_id] = $username;
//                } else {
//                    $username = $cached_username[$user_id];
//                }
//                $msg_final = $msg->toArray();
//                $msg_final['username'] = $username;
//                $messages_final[] = $msg_final;
//            }
//            $data['messages'] = $messages_final;
//            $result['conversations'][] = $data;
//        }
//        return response()->json([
//            'success' => true,
//            'data' => $result
//        ], 200);
//    }

    public function show() // TODO: index
    {
        $user_id = request()->user()->id;
        $conversation_ids = ConversationParticipant::where('user_id', $user_id)->pluck('conversation_id');
        $result = [];
        $result['user_id'] = $user_id;
        $result['conversation_ids']=$conversation_ids;
        foreach ($conversation_ids as $conversation_id) {
            $message_records = Message::where('conversation_id', $conversation_id)
                ->orderBy('created_at', 'asc')
                ->get();
            $data = [];
            $data['conversation_id'] = $conversation_id;
            $data['conversation_title']= Conversation::where('id', $conversation_id)->value('subject');
            $processed_messages = [];
            $cached_username = [];
            foreach ($message_records as $msg) {
                if (!$cached_username || !isset($cached_username[$msg->sender_id])) {
                    $username = User::where('id', $msg->sender_id)->value('name');
                    $cached_username[$msg->sender_id] = $username;
                } else {
                    $username = $cached_username[$msg->sender_id];
                }
                $msg_final = $msg->toArray();
                $msg_final['username'] = $username;
                $processed_messages[] = $msg_final;
            }
            $data['message']=$processed_messages;
            $result['conversations'][]=$data;
        }
        return response()->json([
            'success' => true,
            'data' => $result
        ], 200);
    }

    public function send(Request $request)
    {
        $conversation = Conversation::findOrFail($request->conversation_id);

        $user = $request->user();

        try {
            $message = new Message();
            $message->conversation_id = $request->conversation_id;
            $message->sender_id = $user->id;
            $message->message = $request->message_text;
            $message->save();

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => [
                    'id' => $message->id,
                    'conversation_id' => $message->conversation_id,
                    'sender_id' => $message->sender_id,
                    'message' => $message->message,
                    'is_read' => $message->is_read,
                    'created_at' => $message->created_at,
                    'updated_at' => $message->updated_at
                ]
            ], 201);
        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $exception->getMessage()
            ], 500);
        }
    }
}
