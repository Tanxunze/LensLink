<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\PhotographerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $favorites = DB::table('favorites as f')
            ->join('photographer_profiles as pp', 'f.photographer_id', '=', 'pp.id')
            ->join('users as u', 'pp.user_id', '=', 'u.id')
            ->leftJoin('categories as c', function($join) {
                $join->join('photographer_categories as pc', 'pc.category_id', '=', 'c.id')
                    ->on('pc.photographer_id', '=', 'pp.id');
            })
            ->where('f.customer_id', $userId)
            ->select(
                'pp.id',
                'u.name',
                'u.profile_image',
                'pp.specialization',
                'pp.starting_price',
                'pp.average_rating',
                'pp.review_count',
                'pp.location',
                'u.bio',
                DB::raw('GROUP_CONCAT(DISTINCT c.name) as categories')
            )
            ->groupBy('pp.id', 'u.name', 'u.profile_image', 'pp.specialization',
                'pp.starting_price', 'pp.average_rating', 'pp.review_count',
                'pp.location', 'u.bio')
            ->get();

        return response()->json(['photographers' => $favorites]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photographer_id' => 'required|exists:photographer_profiles,id'
        ]);

        $userId = Auth::id();
        $photographerId = $request->photographer_id;

        $exists = Favorite::where('customer_id', $userId)
            ->where('photographer_id', $photographerId)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Already in favorites'
            ], 200);
        }

        Favorite::create([
            'customer_id' => $userId,
            'photographer_id' => $photographerId
        ]);

        return response()->json([
            'message' => 'Added to favorites successfully'
        ], 201);
    }

    public function destroy($id)
    {
        $userId = Auth::id();

        $favorite = Favorite::where('customer_id', $userId)
            ->where('photographer_id', $id)
            ->first();

        if (!$favorite) {
            return response()->json([
                'message' => 'Favorite not found'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Removed from favorites successfully'
        ], 200);
    }

    public function check($id)
    {
        $userId = Auth::id();

        $exists = Favorite::where('customer_id', $userId)
            ->where('photographer_id', $id)
            ->exists();

        return response()->json([
            'is_favorite' => $exists
        ]);
    }
}
