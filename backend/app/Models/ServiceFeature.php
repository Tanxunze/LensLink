<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'feature',
        'sort_order'
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
