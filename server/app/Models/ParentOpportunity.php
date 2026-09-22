<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParentOpportunity extends Model
{
    use HasFactory;

    protected $table = 'parent_opportunities';

    protected $fillable = [
        'name',
        'category_id',
        'description',
        'data_year',
        'spreadsheet_data',
        'status',
        'image_path',
    ];

    protected $casts = [
        'spreadsheet_data' => 'array',
    ];

    protected $appends = [
        'projects_count',
        'municipalities_summary',
        'total_land_area',
    ];

    /**
     * Get the category that owns this parent opportunity.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get all attached documents for this parent opportunity.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ParentOpportunityDocument::class, 'parent_opportunity_id')->latest();
    }

    /**
     * Get all child investment projects belonging to this parent opportunity.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Opportunity::class, 'parent_opportunity_id')->latest();
    }

    /**
     * Total number of child projects.
     */
    public function getProjectsCountAttribute(): int
    {
        return $this->projects()->count();
    }

    /**
     * Dynamic summary of municipalities covered by child projects (e.g. "Roxas City, Sapian, Pontevedra").
     */
    public function getMunicipalitiesSummaryAttribute(): array
    {
        $municipalityIds = $this->projects()
            ->whereNotNull('municipality_id')
            ->pluck('municipality_id')
            ->unique()
            ->values();

        $names = [];
        foreach ($municipalityIds as $mId) {
            $m = Municipality::find($mId);
            if ($m) {
                $names[] = $m->name;
            }
        }

        return $names;
    }

    /**
     * Sum of land area across all child projects.
     */
    public function getTotalLandAreaAttribute(): float
    {
        return (float) $this->projects()->sum('land_area');
    }
}
