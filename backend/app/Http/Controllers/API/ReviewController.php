<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['customer']);

        if ($request->has('photographer_id')) {
            $query->where('photographer_id', $request->photographer_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();

        return response()->json($reviews);
    }

    public function show(Request $request)
    {
        $id=$request->user()->id;
        $review = Review::with(['customer'])
            ->where('photographer_id', $id)
            ->avg('rating');
        return response()->json([
            'rating' => $review
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photographer_id' => 'required|exists:photographer_profiles,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:255',
            'review' => 'required|string',
            'service_type' => 'required|string|max:255',
            'service_date' => 'required|date'
        ]);

        $review = Review::create([
            'photographer_id' => $request->photographer_id,
            'customer_id' => Auth::id(),
            'rating' => $request->rating,
            'title' => $request->title,
            'review' => $request->review,
            'service_type' => $request->service_type,
            'service_date' => $request->service_date
        ]);

        return response()->json($review, 201);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string'
        ]);

        $review = Review::findOrFail($id);

        // Check if the user is the photographer who owns this review
        $photographerProfile = Auth::user()->photographerProfile;
        if (!$photographerProfile || $photographerProfile->id != $review->photographer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->reply = $request->reply;
        $review->reply_date = now();
        $review->save();

        return response()->json($review);
    }
}
