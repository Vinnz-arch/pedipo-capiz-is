<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    protected $fillable = [
        'fullname',
        'username',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    public function logs()
    {
        return $this->hasMany(UserLog::class, 'user_id');
    }

    /**
     * Check whether this user is a PEDIPO Staff account.
     */
    public function isStaff(): bool
    {
        return $this->role === UserRole::STAFF->value;
    }

    /**
     * Check whether this user is a standard portal user.
     */
    public function isPortalUser(): bool
    {
        return $this->role === UserRole::USER->value || empty($this->role);
    }
}
