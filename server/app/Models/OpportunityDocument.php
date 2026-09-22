<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpportunityDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'opportunity_id',
        'title',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the opportunity that owns the document.
     */
    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }
}
