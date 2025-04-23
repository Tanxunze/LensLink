<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\PortfolioItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class Portfolio extends Controller
{
    //
    public function index(Request $request)
    {
        $p_id = $request->user()->photographerProfile->id;
        $category = $request->input('category');
        $portfolio_id = $request->has('portfolio_id') ?$request->input('portfolio_id'): null;
        try {
            $portfolio_items = $this->getPhotographerPortfolio($p_id, $category, $portfolio_id);
            return response()->json($portfolio_items, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch portfolio items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getPhotographerPortfolio(int $photographer_id, ?string $category = null, ?int $portfolio_id)
    {
        $query = PortfolioItem::where('photographer_id', $photographer_id);
        if ($category) {
            $category_id = Category::where('name', $category)->value('id');
            if ($category_id) {
                $query->where('category_id', $category_id);
            }
        }
        if($portfolio_id) {
            $query->where('id', $portfolio_id);
        }

        $portfolio = $query->get();
        $data = [];

        foreach ($portfolio as $item) {
            $categoryName = Category::find($item->category_id)->name ?? '';

            $data[] = [
                'id' => $item->id,
                'title' => $item->title,
                'category' => $categoryName,
                'image_path' => trim($item->image_path),
                'description' => $item->description,
                'featured' => $item->featured,
                'created_at' => $item->created_at,
            ];
        }
        return $data;
    }

    public function uploadPortfolioImage(Request $request)
    {
        $user = $request->user();
        $photographer = $user->photographerProfile;

        if (!$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'message' => 'No files were uploaded',
                'errors' => ['image' => ['No files were uploaded']]
            ], 422);
        }

        $file = $request->file('image');
        if (!$file->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed',
                'errors' => ['image' => ['Corrupted files or interrupted uploads']]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|file|image|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'validation failure',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filename = 'portfolio_' . $photographer->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $directoryPath = 'images/portfolios';
            $fullDirectoryPath = public_path($directoryPath);

            if (!file_exists($fullDirectoryPath)) {
                mkdir($fullDirectoryPath, 0777, true);
            }

            $file->move($fullDirectoryPath, $filename);
            $imageUrl = url('/api/images/' . $filename);

            return response()->json([
                'success' => true,
                'message' => 'Portfolio image uploaded successfully',
                'image_url' => $imageUrl
            ]);
        } catch (\Exception $e) {
            \Log::error('Portfolio image upload exception', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Server error when processing images',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $photographer = $user->photographerProfile;

        if (!$photographer) {
            return response()->json([
                'success' => false,
                'message' => 'No photographer profile found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required',
            'description' => 'nullable|string',
            'image_path' => 'required|string',
            'featured' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $categoryId = $request->input('category_id');
            if (!is_numeric($categoryId)) {
                $category = \App\Models\Category::where('name', $categoryId)->first();

                if (!$category) {
                    $category = \App\Models\Category::where('slug', strtolower(str_replace(' ', '-', $categoryId)))->first();
                }

                if (!$category) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid category',
                        'errors' => ['category_id' => ['Category not found']]
                    ], 422);
                }
                $categoryId = $category->id;
            }

            $portfolioItem = new \App\Models\PortfolioItem();
            $portfolioItem->photographer_id = $photographer->id;
            $portfolioItem->title = $request->input('title');
            $portfolioItem->category_id = $categoryId;
            $portfolioItem->description = $request->input('description');
            $portfolioItem->image_path = $request->input('image_path');
            $portfolioItem->featured = $request->input('featured', false);
            $portfolioItem->save();
            $photographerProfile = $user->photographerProfile;
            $photographerProfile->categories()->syncWithoutDetaching([$categoryId]);

            return response()->json([
                'success' => true,
                'message' => 'Portfolio item created successfully',
                'data' => $portfolioItem
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create portfolio item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $photographer = $user->photographerProfile;
        $portfolioId = $request->input('id');

        if (!$photographer) {
            return response()->json([
                'success' => false,
                'message' => 'No photographer profile found'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'id' => 'required|exists:portfolio_items,id',
            'title' => 'required|string|max:255',
            'category_id' => 'required',
            'description' => 'nullable|string',
            'image_path' => 'sometimes|string',
            'featured' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $portfolioItem = \App\Models\PortfolioItem::where('id', $portfolioId)
                ->where('photographer_id', $photographer->id)
                ->first();

            if (!$portfolioItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Portfolio item not found or not authorized',
                ], 404);
            }

            $categoryId = $request->input('category_id');
            if (!is_numeric($categoryId)) {
                $category = \App\Models\Category::where('name', $categoryId)->first();

                if (!$category) {
                    $category = \App\Models\Category::where('slug', strtolower(str_replace(' ', '-', $categoryId)))->first();
                }

                if (!$category) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid category',
                        'errors' => ['category_id' => ['Category not found']]
                    ], 422);
                }
                $categoryId = $category->id;
            }

            $portfolioItem->title = $request->input('title');
            $portfolioItem->category_id = $categoryId;
            $portfolioItem->description = $request->input('description');
            if ($request->has('image_path')) {
                $portfolioItem->image_path = $request->input('image_path');
            }
            $portfolioItem->featured = $request->input('featured', false);
            $portfolioItem->save();
            $photographerProfile = $user->photographerProfile;
            $photographerProfile->categories()->syncWithoutDetaching([$categoryId]);

            return response()->json([
                'success' => true,
                'message' => 'Portfolio item updated successfully',
                'data' => $portfolioItem
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update portfolio item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
