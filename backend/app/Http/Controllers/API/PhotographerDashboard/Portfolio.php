<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\PortfolioItem;
use Illuminate\Http\Request;

class Portfolio extends Controller
{
    //
    public function index(Request $request)
    {
        $p_id = $request->input('photographer_id');
        try
        {
            $portfolio_items=$this->getPhotographerPortfolio($p_id);
            $result=[
                'success'=>true,
                'data'=>[
                    'portfolioItems'=>$portfolio_items
                ]
            ];
            return response()->json($result,200);
        }
        catch(\Exception $e)
        {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch portfolio items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getPhotographerPortfolio(int $photographer_id)
    {
        $portfolio = PortfolioItem::where('photographer_id', $photographer_id)->get();
        $data = [];
        foreach($portfolio as $item)
        {
            $data[] = [
                'id' => $item->id,
                'title' => $item->title,
                'image' => $item->image_path,
                'description' => $item->description,
                'featured' => $item->featured,
                'created_at' => $item->created_at,
            ];
        }
        return $data;
    }
}
