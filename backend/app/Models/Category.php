<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description'
    ];

    public function photographers()
    {
        return $this->belongsToMany(PhotographerProfile::class, 'photographer_categories', 'category_id', 'photographer_id');
    }

    public function portfolioItems()
    {
        return $this->hasMany(PortfolioItem::class);
    }
}
