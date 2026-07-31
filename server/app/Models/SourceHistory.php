<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SourceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_id',
        'status',
        'records_scraped',
        'error_message',
        'run_at',
    ];

    protected $casts = [
        'records_scraped' => 'integer',
        'run_at' => 'datetime',
    ];

    /**
     * Get the source for this history.
     */
    public function source(): BelongsTo
    {
        return $this->belongsTo(IndicatorSource::class, 'source_id');
    }
}
