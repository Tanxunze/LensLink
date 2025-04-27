<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'reports';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'reporter_id',
        'reason',
        'status',
        'resolved_by',
        'resolved_at',
        'admin_notes'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the reported user.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the reporter.
     */
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Get the admin who resolved the report.
     */
    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
