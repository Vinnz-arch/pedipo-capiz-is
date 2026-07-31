<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Indicator;
use App\Models\IndicatorSource;
use App\Models\IndicatorValue;
use App\Models\Municipality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminManualUploadController extends Controller
{
    /**
     * Upload a single or multiple indicator values manually.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'data' => 'required|array',
            'data.*.municipality_id' => 'required|exists:municipalities,id',
            'data.*.indicator_code' => 'required|exists:indicators,code',
            'data.*.source_code' => 'required|exists:indicator_sources,code',
            'data.*.value' => 'required|numeric',
            'data.*.year' => 'required|integer|min:2000|max:2099',
            'data.*.quarter' => 'nullable|integer|min:1|max:4',
            'data.*.verification_status' => 'nullable|string|in:verified,pending,unverified',
        ]);

        $uploadedCount = 0;
        $dataRows = $request->input('data');

        foreach ($dataRows as $row) {
            $indicator = Indicator::where('code', $row['indicator_code'])->first();
            $source = IndicatorSource::where('code', $row['source_code'])->first();

            if (!$indicator || !$source) {
                continue;
            }

            IndicatorValue::updateOrCreate(
                [
                    'municipality_id' => $row['municipality_id'],
                    'indicator_id' => $indicator->id,
                    'year' => $row['year'],
                    'quarter' => $row['quarter'] ?? null,
                ],
                [
                    'source_id' => $source->id,
                    'value' => $row['value'],
                    'verification_status' => $row['verification_status'] ?? 'verified',
                    'retrieved_at' => now(),
                ]
            );
            $uploadedCount++;
        }

        // Flush comparison cache to ensure changes are immediately visible
        Cache::flush();

        return response()->json([
            'message' => "Successfully uploaded {$uploadedCount} indicator records.",
            'records_uploaded' => $uploadedCount,
        ]);
    }
}
