<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceFeature;
use App\Models\PhotographerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with(['photographer.user', 'features']);

        //search
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $keywords = preg_split('/[\s,]+/', $searchTerm, -1, PREG_SPLIT_NO_EMPTY);

            $query->where(function($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $q->orWhere('name', 'LIKE', "%{$keyword}%")
                        ->orWhere('description', 'LIKE', "%{$keyword}%")
                        ->orWhereHas('features', function($query) use ($keyword) {
                            $query->where('feature', 'LIKE', "%{$keyword}%");
                        })
                        ->orWhereHas('photographer.user', function($query) use ($keyword) {
                            $query->where('name', 'LIKE', "%{$keyword}%");
                        });
                }
            });
        }

        // Apply filters
        if ($request->has('category')) {
            $category = $request->input('category');
            $query->whereHas('photographer.categories', function($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        if ($request->has('featured')) {
            $query->where('is_featured', $request->input('featured') === 'true');
        }

        // Apply sorting
        if ($request->has('sort')) {
            switch ($request->input('sort')) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('photographer_id', 'desc')
                        ->whereHas('photographer', function($q) {
                            $q->orderBy('average_rating', 'desc');
                        });
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Pagination
        $limit = $request->input('limit', 12);
        $services = $query->paginate($limit);

        // Format response data
        $formattedServices = $services->map(function($service) {
            return [
                'id' => $service->id,
                'title' => $service->name,
                'description' => $service->description,
                'short_description' => substr($service->description, 0, 100) . (strlen($service->description) > 100 ? '...' : ''),
                'price_range' => '€' . number_format($service->price, 2),
                'duration' => $this->formatDuration($service->duration),
                'category' => $service->categories->first() ? $service->categories->first()->slug : null,
                'image_url' => $service->image_url ?? $service->photographer->banner_image ?? null,
                'photographer' => [
                    'id' => $service->photographer->id,
                    'name' => $service->photographer->user->name,
                    'profile_image' => $service->photographer->user->profile_image,
                    'rating' => $service->photographer->average_rating,
                ],
                'features' => $service->features->pluck('feature')->toArray(),
            ];
        });

        return response()->json([
            'services' => $formattedServices,
            'pagination' => [
                'total' => $services->total(),
                'per_page' => $services->perPage(),
                'current_page' => $services->currentPage(),
                'total_pages' => $services->lastPage(),
            ]
        ]);
    }

    //Get service details by ID
    public function show($id)
    {
        $service = Service::with(['photographer.user', 'photographer.categories', 'features'])
            ->findOrFail($id);

        // Format the detailed service
        $formattedService = [
            'id' => $service->id,
            'title' => $service->name,
            'description' => $service->description,
            'short_description' => substr($service->description, 0, 100) . (strlen($service->description) > 100 ? '...' : ''),
            'price_range' => '€' . number_format($service->price, 2),
            'duration' => $this->formatDuration($service->duration),
            'category' => $service->categories->first() ? $service->categories->first()->slug : null,
            'image_url' => $service->image_url ?? $service->photographer->banner_image ?? null,
            'photographer' => [
                'id' => $service->photographer->id,
                'name' => $service->photographer->user->name,
                'profile_image' => $service->photographer->user->profile_image,
                'rating' => $service->photographer->average_rating,
                'specialization' => $service->photographer->specialization,
                'location' => $service->photographer->location,
                'bio_excerpt' => substr($service->photographer->user->bio, 0, 150) . (strlen($service->photographer->user->bio) > 150 ? '...' : ''),
            ],
            'features' => $service->features->pluck('feature')->toArray(),
            'packages' => [
                [
                    'title' => 'Standard Package',
                    'price' => '€' . number_format($service->price, 2),
                    'description' => 'Standard ' . $service->name . ' package',
                    'features' => array_slice($service->features->pluck('feature')->toArray(), 0, 3),
                ]
            ]
        ];

        return response()->json(['service' => $formattedService]);
    }

   //Get services for a specific photographer
    public function photographerServices($id)
    {
        $photographer = PhotographerProfile::with('user')->findOrFail($id);

        $services = Service::where('photographer_id', $id)
            ->with('features')
            ->get();

        $formattedServices = $services->map(function($service) {
            return [
                'id' => $service->id,
                'title' => $service->name,
                'short_description' => substr($service->description, 0, 100) . (strlen($service->description) > 100 ? '...' : ''),
                'price_range' => '€' . number_format($service->price, 2),
                'duration' => $this->formatDuration($service->duration),
                'category' => $service->categories->first() ? $service->categories->first()->slug : null,
                'image_url' => $service->image_url ?? $service->photographer->banner_image ?? null,
            ];
        });

        return response()->json([
            'photographer' => [
                'id' => $photographer->id,
                'name' => $photographer->user->name,
                'profile_image' => $photographer->user->profile_image,
            ],
            'services' => $formattedServices
        ]);
    }

   //Create a new service (for photographer only)
    public function store(Request $request)
    {
        // Check if authenticated user is a photographer
        if (Auth::user()->role !== 'photographer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'duration' => 'required|integer|min:0',
            'is_featured' => 'boolean',
            'features' => 'required|array|min:1',
            'features.*' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get photographer profile ID
        $photographerProfile = PhotographerProfile::where('user_id', Auth::id())->first();

        if (!$photographerProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Photographer profile not found',
            ], 404);
        }

        // Create service
        $service = Service::create([
            'photographer_id' => $photographerProfile->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration' => $request->duration,
            'unit' => $request->unit,
            'is_featured' => $request->is_featured ?? false,
            'is_active' => true,
        ]);

        if ($request->has('category_id')) {
            $service->categories()->attach($request->category_id);
        } else {
            // 默认使用摄影师的第一个分类
            $defaultCategory = $photographerProfile->categories->first();
            if ($defaultCategory) {
                $service->categories()->attach($defaultCategory->id);
            }
        }

        // Add features
        $featuresData = [];
        foreach ($request->features as $index => $feature) {
            $featuresData[] = [
                'service_id' => $service->id,
                'feature' => $feature,
                'sort_order' => $index,
                'created_at' => now(),
            ];
        }

        ServiceFeature::insert($featuresData);

        // Reload service with features
        $service = Service::with('features')->find($service->id);

        return response()->json([
            'success' => true,
            'message' => 'Service added successfully',
            'data' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'unit' => $service->unit,
                'duration' => $service->duration,
                'is_featured' => $service->is_featured,
                'features' => $service->features->pluck('feature')->toArray(),
                'created_at' => $service->created_at->format('Y-m-d\TH:i:s\Z'),
            ]
        ], 201);
    }

//Update an existing service (for photographer only)
    public function update(Request $request, $id)
    {
        // Check if authenticated user is a photographer
        if (Auth::user()->role !== 'photographer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'unit' => 'string|max:50',
            'duration' => 'integer|min:0',
            'is_featured' => 'boolean',
            'features' => 'array',
            'features.*' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $photographerProfile = PhotographerProfile::where('user_id', Auth::id())->first();

        $service = Service::where('id', $id)
            ->where('photographer_id', $photographerProfile->id)
            ->first();

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found or you do not own this service',
            ], 404);
        }

        if ($request->has('category_id')) {
            $service->categories()->sync([$request->category_id]);
        }

        $service->update($request->only([
            'name', 'description', 'price', 'duration', 'unit', 'is_featured'
        ]));

        if ($request->has('features')) {
            ServiceFeature::where('service_id', $service->id)->delete();
            $featuresData = [];
            foreach ($request->features as $index => $feature) {
                $featuresData[] = [
                    'service_id' => $service->id,
                    'feature' => $feature,
                    'sort_order' => $index,
                    'created_at' => now(),
                ];
            }

            ServiceFeature::insert($featuresData);
        }

        // Reload service with features
        $service = Service::with('features')->find($service->id);

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'unit' => $service->unit,
                'duration' => $service->duration,
                'is_featured' => $service->is_featured,
                'features' => $service->features->pluck('feature')->toArray(),
                'updated_at' => $service->updated_at->format('Y-m-d\TH:i:s\Z'),
            ]
        ]);
    }

//Delete a service (for photographer only)
    public function destroy($id)
    {
        // Check if authenticated user is a photographer
        if (Auth::user()->role !== 'photographer') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action',
            ], 403);
        }

        // Get photographer profile ID
        $photographerProfile = PhotographerProfile::where('user_id', Auth::id())->first();

        // Find service and verify ownership
        $service = Service::where('id', $id)
            ->where('photographer_id', $photographerProfile->id)
            ->first();

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found or you do not own this service',
            ], 404);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully',
        ]);
    }

//Helper func
    private function formatDuration($minutes)
    {
        if ($minutes < 60) {
            return $minutes . ' minutes';
        } else {
            $hours = floor($minutes / 60);
            $remainingMinutes = $minutes % 60;

            if ($remainingMinutes == 0) {
                return $hours . ' hour' . ($hours > 1 ? 's' : '');
            } else {
                return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ' . $remainingMinutes . ' min';
            }
        }
    }
}
