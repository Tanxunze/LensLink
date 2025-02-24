<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotographerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization',
        'experience_years',
        'photoshoot_count',
        'location',
        'starting_price',
        'banner_image',
        'featured',
        'verified',
        'average_rating',
        'review_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'photographer_categories', 'photographer_id', 'category_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'photographer_id');
    }

    public function portfolioItems()
    {
        return $this->hasMany(PortfolioItem::class, 'photographer_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'photographer_id');
    }
}
