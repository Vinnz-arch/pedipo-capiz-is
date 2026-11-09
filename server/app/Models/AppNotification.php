<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    use HasFactory;

    protected $table = 'app_notifications';

    protected $fillable = [
        'user_id',
        'role',
        'type',
        'title',
        'message',
        'action_url',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeForClient($query, $userId)
    {
        return $query->where('role', 'client')
                     ->where(function ($q) use ($userId) {
                         $q->where('user_id', $userId)
                           ->orWhereNull('user_id');
                     });
    }
}
