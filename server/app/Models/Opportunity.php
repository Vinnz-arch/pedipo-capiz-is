<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Opportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_name',
        'category_id',
        'municipality_id',
        'roi_estimate',
        'land_area',
        'key_incentives',
        'description',
        'incentive_package',
        'image_path',
        'status',
        'location',
        'source_name',
        'source_url',
    ];

    protected $casts = [
        'roi_estimate' => 'float',
        'land_area' => 'float',
    ];

    /**
     * Get the category that owns the opportunity.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the municipality that owns the opportunity.
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }
}
