<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'opportunity_id',
        'investor_name',
        'email',
        'company',
        'contact_number',
        'address',
        'subject',
        'purpose',
        'letter_of_intent',
        'supporting_documents',
        'message',
        'status',
        'admin_notes',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user associated with the inquiry (if submitted by an authenticated client).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the opportunity associated with the inquiry.
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }
}
