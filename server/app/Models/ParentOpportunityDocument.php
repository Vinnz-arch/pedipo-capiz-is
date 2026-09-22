<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentOpportunityDocument extends Model
{
    use HasFactory;

    protected $table = 'parent_opportunity_documents';

    protected $fillable = [
        'parent_opportunity_id',
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
     * Get the parent opportunity that owns the document.
     */
    public function parentOpportunity(): BelongsTo
    {
        return $this->belongsTo(ParentOpportunity::class, 'parent_opportunity_id');
    }
}
