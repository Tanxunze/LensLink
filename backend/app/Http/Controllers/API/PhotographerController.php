<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PhotographerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PhotographerController extends Controller
{
    public function index(Request $request)
    {
        $query = PhotographerProfile::with(['user', 'categories'])
            ->join('users', 'photographer_profiles.user_id', '=', 'users.id')
            ->select('photographer_profiles.*', 'users.name', 'users.email', 'users.profile_image');

        // search filter
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $keywords = preg_split('/[\s,]+/', $searchTerm, -1, PREG_SPLIT_NO_EMPTY);

            $query->where(function ($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $q->orWhere('users.name', 'like', "%{$keyword}%")
                        ->orWhere('photographer_profiles.specialization', 'like', "%{$keyword}%")
                        ->orWhere('photographer_profiles.location', 'like', "%{$keyword}%")
                        ->orWhere('users.bio', 'like', "%{$keyword}%");
                }
            });
        }

        // categories filter
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.slug', $request->category);
            });
        }

        // price filter
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('starting_price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('starting_price', '<=', $request->max_price);
        }


        $query->addSelect([
            'calculated_rating' => DB::table('reviews')
                ->selectRaw('ROUND(COALESCE(AVG(rating), 0), 2)')
                ->whereColumn('photographer_id', 'photographer_profiles.id')
                ->where('is_published', true),
            'calculated_review_count' => DB::table('reviews')
                ->selectRaw('COUNT(*)')
                ->whereColumn('photographer_id', 'photographer_profiles.id')
                ->where('is_published', true)
        ]);

        // rating filter
        if ($request->has('min_rating') && is_numeric($request->min_rating)) {
            $query->having('calculated_rating', '>=', $request->min_rating);
        }

        // sort
        $sortBy = $request->sort_by ?? 'calculated_rating';
        $sortDirection = $request->sort_direction ?? 'desc';
        $allowedSortFields = ['calculated_rating', 'starting_price', 'experience_years', 'calculated_review_count'];


        $sortFieldMap = [
            'average_rating' => 'calculated_rating',
            'review_count' => 'calculated_review_count'
        ];

        $actualSortField = $sortFieldMap[$sortBy] ?? $sortBy;
        if (in_array($actualSortField, $allowedSortFields)) {
            $query->orderBy($actualSortField, $sortDirection);
        }

        $perPage = $request->per_page ?? 9; // page limit
        $photographers = $query->paginate($perPage);

        // format data
        $formattedData = $photographers->map(function ($photographer) {
            return [
                'id' => $photographer->id,
                'name' => $photographer->name,
                'image' => $photographer->profile_image,
                'specialization' => $photographer->specialization,
                'location' => $photographer->location,
                'experience' => $photographer->experience_years . ' years',
                'photoshoot_count' => $photographer->photoshoot_count,
                'rating' => $photographer->calculated_rating,
                'review_count' => $photographer->calculated_review_count,
                'startingPrice' => $photographer->starting_price,
                'description' => $photographer->user->bio,
                'featured' => $photographer->featured,
                'categories' => $photographer->categories->pluck('name')
            ];
        });

        return response()->json([
            'data' => $formattedData,
            'pagination' => [
                'total' => $photographers->total(),
                'per_page' => $photographers->perPage(),
                'current_page' => $photographers->currentPage(),
                'last_page' => $photographers->lastPage(),
            ]
        ]);
    }

    public function show($id)
    {
        $photographer = PhotographerProfile::with(['user', 'categories', 'services', 'portfolioItems'])
            ->findOrFail($id);

        $services = $photographer->services->map(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'unit' => $service->unit,
                'duration' => $service->duration,
                'is_featured' => $service->is_featured,
                'features' => $service->features->pluck('feature')
            ];
        });

        $portfolio = $photographer->portfolioItems->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'image' => $item->image_path,
                'category' => $item->category->name ?? null,
                'featured' => $item->featured
            ];
        });

        $reviews = DB::table('reviews')
            ->join('users', 'reviews.customer_id', '=', 'users.id')
            ->where('reviews.photographer_id', $id)
            ->where('reviews.is_published', true)
            ->select('reviews.*', 'users.name as customer_name', 'users.profile_image as customer_image')
            ->limit(5)
            ->get();

        // Calculate average rating dynamically from reviews and round to 2 decimal places
        $avgRating = DB::table('reviews')
            ->where('photographer_id', $id)
            ->where('is_published', true)
            ->selectRaw('ROUND(COALESCE(AVG(rating), 0), 2) as avg_rating')
            ->value('avg_rating');

        $reviewCount = DB::table('reviews')
            ->where('photographer_id', $id)
            ->where('is_published', true)
            ->count();

        return response()->json([
            'id' => $photographer->id,
            'name' => $photographer->user->name,
            'email' => $photographer->user->email,
            'profile_image' => $photographer->user->profile_image,
            'banner_image' => $photographer->banner_image,
            'bio' => $photographer->user->bio,
            'specialization' => $photographer->specialization,
            'location' => $photographer->location,
            'experience_years' => $photographer->experience_years,
            'photoshoot_count' => $photographer->photoshoot_count,
            'rating' => $avgRating,
            'review_count' => $reviewCount,
            'starting_price' => $photographer->starting_price,
            'categories' => $photographer->categories->pluck('name'),
            'services' => $services,
            'portfolio' => $portfolio,
            'reviews' => $reviews
        ]);
    }

    public function recommended(Request $request)
    {
        $limit = $request->limit ?? 3;

        $photographers = PhotographerProfile::with(['user'])
            ->orderBy('average_rating', 'desc')
            ->limit($limit)
            ->get();

        $formattedData = $photographers->map(function ($photographer) {
            return [
                'id' => $photographer->id,
                'name' => $photographer->user->name,
                'image' => $photographer->user->profile_image,
                'specialization' => $photographer->specialization,
                'rating' => $photographer->average_rating ?: 0,
                'bio' => $photographer->user->bio,
                'starting_price' => $photographer->starting_price ?: 0
            ];
        });

        return response()->json([
            'photographers' => $formattedData
        ]);
    }
}
