<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'photographer_id',
        'name',
        'description',
        'price',
        'duration',
        'unit',
        'is_featured',
        'is_active',
        'image_url'
    ];

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }

    public function features()
    {
        return $this->hasMany(ServiceFeature::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'service_categories', 'service_id', 'category_id');
    }
}
