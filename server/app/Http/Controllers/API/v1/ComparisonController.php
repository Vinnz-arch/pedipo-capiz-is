<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Indicator;
use App\Models\IndicatorValue;
use App\Models\Municipality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ComparisonController extends Controller
{
    /**
     * Display comparison data for selected municipalities.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'municipalities' => 'required|string',
            'year' => 'nullable|integer',
        ]);

        $muniNames = array_map('trim', explode(',', $request->input('municipalities')));
        $year = $request->input('year', 2025);

        // Generate cache key based on query parameters
        $cacheKey = 'comparison_' . md5(implode('_', $muniNames) . '_' . $year);

        $data = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($muniNames, $year) {
            // Retrieve selected municipalities
            $selectedMunicipalities = Municipality::whereIn('name', $muniNames)->get();

            if ($selectedMunicipalities->isEmpty()) {
                return [
                    'selected' => [],
                    'indicators' => [],
                    'provincialAverages' => []
                ];
            }

            $selectedIds = $selectedMunicipalities->pluck('id')->toArray();

            // Retrieve all indicators
            $indicators = Indicator::all();

            // Retrieve values for selected municipalities
            $values = IndicatorValue::with(['indicator', 'source'])
                ->whereIn('municipality_id', $selectedIds)
                ->where('year', $year)
                ->get();

            // Structure the values by municipality id
            $muniValues = [];
            foreach ($values as $val) {
                $muniValues[$val->municipality_id][$val->indicator->code] = [
                    'value' => (float) $val->value,
                    'year' => $val->year,
                    'quarter' => $val->quarter,
                    'source' => $val->source->code,
                    'source_name' => $val->source->name,
                    'source_url' => $val->source->website_url,
                    'confidence_level' => $val->source->confidence_level,
                    'last_updated' => $val->updated_at->toIso8601String(),
                ];
            }

            // Map values to municipality records
            $selected = $selectedMunicipalities->map(function ($muni) use ($muniValues) {
                return [
                    'id' => $muni->id,
                    'name' => $muni->name,
                    'class' => $muni->class,
                    'population' => $muni->population,
                    'land_area' => (float) $muni->land_area,
                    'seal_path' => $muni->seal_path,
                    'website_url' => $muni->website_url,
                    'values' => $muniValues[$muni->id] ?? [],
                ];
            });

            // Calculate provincial averages across ALL municipalities in the system
            $allMuniIds = Municipality::pluck('id')->toArray();
            $allValues = IndicatorValue::with('indicator')
                ->whereIn('municipality_id', $allMuniIds)
                ->where('year', $year)
                ->get();

            $groupedValues = [];
            foreach ($allValues as $val) {
                $groupedValues[$val->indicator->code][] = (float) $val->value;
            }

            $provincialAverages = [];
            foreach ($groupedValues as $code => $vals) {
                $provincialAverages[$code] = count($vals) > 0 ? round(array_sum($vals) / count($vals), 2) : 0;
            }

            return [
                'selected' => $selected,
                'indicators' => $indicators,
                'provincialAverages' => $provincialAverages,
            ];
        });

        return response()->json($data);
    }

    /**
     * Display the latest updates to indicator values.
     */
    public function latestUpdates(): JsonResponse
    {
        $cacheKey = 'latest_updates';

        $updates = Cache::remember($cacheKey, now()->addMinutes(10), function () {
            return IndicatorValue::with(['municipality', 'indicator', 'source'])
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($val) {
                    return [
                        'id' => $val->id,
                        'municipality_name' => $val->municipality->name,
                        'indicator_name' => $val->indicator->name,
                        'indicator_code' => $val->indicator->code,
                        'value' => (float) $val->value,
                        'unit' => $val->indicator->unit,
                        'year' => $val->year,
                        'source' => $val->source->code,
                        'last_updated' => $val->updated_at->diffForHumans(),
                    ];
                });
        });

        return response()->json([
            'updates' => $updates,
        ]);
    }
}
