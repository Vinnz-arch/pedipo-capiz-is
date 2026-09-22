<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardStatistic extends Model
{
    use HasFactory;

    protected $table = 'dashboard_statistics';

    protected $fillable = [
        'metric_key',
        'value',
        'display_value',
        'unit',
        'reference_year',
        'growth_rate',
        'source_name',
        'source_url',
        'source_title',
        'retrieved_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'value' => 'float',
        'growth_rate' => 'float',
        'reference_year' => 'integer',
        'retrieved_at' => 'datetime',
    ];
}
