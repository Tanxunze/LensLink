<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BanList extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reason',
        'duration',
        'expires_at',
        'banned_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    public function isActive()
    {
        if ($this->expires_at === null) {
            return true; // Permanent ban
        }

        return $this->expires_at->isFuture();
    }
}
