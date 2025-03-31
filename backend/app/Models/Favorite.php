<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = ['customer_id', 'photographer_id'];
    public $timestamps = false;
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function photographer()
    {
        return $this->belongsTo(PhotographerProfile::class, 'photographer_id');
    }
}
