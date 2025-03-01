<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'photographer_id',
        'customer_id',
        'subject'
    ];

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }
}
