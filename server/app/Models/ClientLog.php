<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'action',
        'ip_address',
        'user_agent',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
