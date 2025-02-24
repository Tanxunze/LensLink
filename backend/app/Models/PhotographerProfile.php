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
        'review_count'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
