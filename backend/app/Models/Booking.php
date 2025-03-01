<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'photographer_id',
        'customer_id',
        'service_id',
        'booking_date',
        'start_time',
        'location',
        'notes',
        'status',
        'total_amount',
        'cancelled_by',
        'cancelled_at'
    ];

    protected $casts = [
        'booking_date' => 'date',
        'cancelled_at' => 'datetime',
        'total_amount' => 'float'
    ];

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
