<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Opportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_opportunity_id',
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
        'spreadsheet_data',
    ];

    protected $casts = [
        'roi_estimate' => 'float',
        'land_area' => 'float',
        'spreadsheet_data' => 'array',
    ];

    protected $appends = ['municipality'];

    /**
     * Get the parent opportunity that owns this child project.
     */
    public function parentOpportunity(): BelongsTo
    {
        return $this->belongsTo(ParentOpportunity::class, 'parent_opportunity_id');
    }

    /**
     * Get the category that owns the opportunity.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all documents attached to this opportunity.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(OpportunityDocument::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the static municipality that owns the opportunity.
     */
    public function getMunicipalityAttribute()
    {
        return Municipality::find($this->municipality_id);
    }

    /**
     * Delete the project's stored local image file when present.
     */
    public function deleteStoredImageFile(): void
    {
        if (!$this->image_path || !str_starts_with($this->image_path, '/storage/')) {
            return;
        }

        $relativePath = substr($this->image_path, strlen('/storage/'));
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
