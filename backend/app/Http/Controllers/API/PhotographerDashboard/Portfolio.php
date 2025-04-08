<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\PortfolioItem;
use Illuminate\Http\Request;

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
}
