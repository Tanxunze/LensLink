<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'action',
        'ip_address',
        'details',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
