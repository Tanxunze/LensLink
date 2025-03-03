<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UtilityController extends Controller
{
    public function getSortOptions($entity)
    {
        $options = [];
        switch($entity) {
            case 'photographers':
                $options = [
                    ['value' => 'rating_desc', 'label' => 'Highest Rated'],
                    ['value' => 'price_asc', 'label' => 'Price: Low to High'],
                    ['value' => 'price_desc', 'label' => 'Price: High to Low'],
                    ['value' => 'experience_desc', 'label' => 'Most Experienced'],
                    ['value' => 'reviews_desc', 'label' => 'Most Reviewed']
                ];
                break;

            case 'services':
                $options = [
                    ['value' => 'rating_desc', 'label' => 'Highest Rated'],
                    ['value' => 'price_asc', 'label' => 'Price: Low to High'],
                    ['value' => 'price_desc', 'label' => 'Price: High to Low'],
                    ['value' => 'newest', 'label' => 'Newest First']
                ];
                break;

            default:
                $options = [
                    ['value' => 'newest', 'label' => 'Newest First'],
                    ['value' => 'oldest', 'label' => 'Oldest First']
                ];
        }

        return response()->json($options);
    }

    public function getRatingOptions()
    {
        $options = [
            ['value' => '4.5', 'label' => '4.5+ ⭐'],
            ['value' => '4', 'label' => '4.0+ ⭐'],
            ['value' => '3.5', 'label' => '3.5+ ⭐'],
            ['value' => '3', 'label' => '3.0+ ⭐']
        ];

        return response()->json($options);
    }
}
