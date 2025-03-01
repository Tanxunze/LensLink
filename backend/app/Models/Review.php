<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'photographer_id',
        'customer_id',
        'rating',
        'title',
        'review',
        'service_type',
        'service_date',
        'reply',
        'reply_date'
    ];

    protected $casts = [
        'service_date' => 'date',
        'reply_date' => 'date'
    ];

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
