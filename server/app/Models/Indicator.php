<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Indicator extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'category',
        'unit',
        'description',
    ];

    /**
     * Get the values for this indicator.
     */
    public function values(): HasMany
    {
        return $this->hasMany(IndicatorValue::class, 'indicator_id');
    }
}
