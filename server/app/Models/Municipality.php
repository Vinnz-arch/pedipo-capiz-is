<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Municipality extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'class',
        'population',
        'land_area',
        'barangay_count',
        'gdp',
        'key_industries',
        'description',
        'seal_path',
        'contact_email',
        'contact_phone',
        'website_url',
    ];

    /**
     * Boot the model to automatically generate slug.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($municipality) {
            if (empty($municipality->slug)) {
                $municipality->slug = Str::slug($municipality->name);
            }
        });
    }

    /**
     * Get the indicator values for the municipality.
     */
    public function indicatorValues()
    {
        return $this->hasMany(IndicatorValue::class, 'municipality_id');
    }
}

