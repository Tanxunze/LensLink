<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'photographer_id',
        'title',
        'description',
        'image_path',
        'category_id',
        'featured',
        'sort_order'
    ];

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
