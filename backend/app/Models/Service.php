<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'photographer_id',
        'name',
        'description',
        'price',
        'duration',
        'unit',
        'is_featured',
        'is_active'
    ];

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }

    public function features()
    {
        return $this->hasMany(ServiceFeature::class);
    }
}
