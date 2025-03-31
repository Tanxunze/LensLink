<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'profile_image',
        'bio',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isPhotographer()
    {
        return $this->role === 'photographer';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }

    public function photographerProfile()
    {
        return $this->hasOne(PhotographerProfile::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'customer_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'customer_id');
    }

    public function userDetail()
    {
        return $this->hasOne(UserDetail::class);
    }
}
