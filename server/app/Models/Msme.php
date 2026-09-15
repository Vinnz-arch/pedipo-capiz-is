<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Msme extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'msmes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_name',
        'owner_name',
        'category_id',
        'enterprise_type',
        'municipality_id',
        'barangay',
        'complete_address',
        'contact_number',
        'email_address',
        'business_description',
        'products_services',
        'logo_path',
        'cover_path',
        'product_image_1',
        'product_image_2',
        'product_image_3',
        'status',
        'date_registered',
        'latitude',
        'longitude',
        'is_archived',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_registered' => 'date',
        'is_archived' => 'boolean',
        'latitude' => 'double',
        'longitude' => 'double',
    ];

    protected $appends = ['municipality'];

    /**
     * Get the category that the MSME belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get the static municipality that the MSME belongs to.
     */
    public function getMunicipalityAttribute()
    {
        return Municipality::find($this->municipality_id);
    }
}
