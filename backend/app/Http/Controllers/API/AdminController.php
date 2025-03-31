<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getStats()
    {
        return response()->json([
            'total_users' => 1240,
            'total_photographers' => 320,
            'pending_approvals' => 12,
            'revenue' => 15700
        ]);
    }

    public function getRecentUsers()
    {
        return response()->json([
            ['id' => 1, 'name' => 'Olivia', 'email' => 'olivia@example.com', 'registered_at' => '2025-03-10', 'status' => 'Active'],
            ['id' => 2, 'name' => 'Ethan', 'email' => 'ethan@example.com', 'registered_at' => '2025-03-08', 'status' => 'Pending']
        ]);
    }

    public function getLogs()
    {
        return response()->json([
            ['id' => 1, 'action' => 'User Olivia approved', 'admin' => 'John', 'date' => '2025-03-10'],
            ['id' => 2, 'action' => 'Photographer Ethan suspended', 'admin' => 'Sarah', 'date' => '2025-03-08']
        ]);
    }

    public function getComments()
    {
        return response()->json([
            ['id' => 1, 'user' => 'Olivia', 'comment' => 'Here is inappropriate content'],
            ['id' => 2, 'user' => 'Ethan', 'comment' => 'Spam messages']
        ]);
    }

    public function deleteComment($id)
    {
        return response()->json(['message' => "Comment $id deleted."], 200);
    }

    public function banUser($id, Request $request)
    {
        $duration = $request->input('duration'); // 24H, 7D, Permanent
        return response()->json(['message' => "User $id has been banned for $duration."], 200);
    }
}
