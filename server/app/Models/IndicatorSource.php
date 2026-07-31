<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndicatorSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'website_url',
        'logo_path',
        'description',
        'confidence_level',
    ];

    /**
     * Get the indicator values for this source.
     */
    public function indicatorValues(): HasMany
    {
        return $this->hasMany(IndicatorValue::class, 'source_id');
    }

    /**
     * Get the scraping histories for this source.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(SourceHistory::class, 'source_id');
    }
}
