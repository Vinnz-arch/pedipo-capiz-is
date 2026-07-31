<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Indicator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndicatorController extends Controller
{
    /**
     * Display a listing of the indicators.
     */
    public function index(): JsonResponse
    {
        $indicators = Indicator::orderBy('category', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'indicators' => $indicators,
        ]);
    }

    /**
     * Display the specified indicator.
     */
    public function show(int $id): JsonResponse
    {
        $indicator = Indicator::with('values.municipality')->find($id);

        if (!$indicator) {
            return response()->json(['message' => 'Indicator not found.'], 404);
        }

        return response()->json([
            'indicator' => $indicator,
        ]);
    }
}
