<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndicatorValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'municipality_id',
        'indicator_id',
        'source_id',
        'value',
        'year',
        'quarter',
        'verification_status',
        'retrieved_at',
        'last_updated',
    ];

    protected $casts = [
        'value' => 'float',
        'year' => 'integer',
        'quarter' => 'integer',
        'retrieved_at' => 'datetime',
        'last_updated' => 'datetime',
    ];

    /**
     * Get the municipality that owns this indicator value.
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipality_id');
    }

    /**
     * Get the indicator associated with this value.
     */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(Indicator::class, 'indicator_id');
    }

    /**
     * Get the source that published this value.
     */
    public function source(): BelongsTo
    {
        return $this->belongsTo(IndicatorSource::class, 'source_id');
    }
}
