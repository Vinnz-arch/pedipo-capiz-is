<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\IndicatorSource;
use App\Models\SourceHistory;
use Illuminate\Http\JsonResponse;

class SourceHistoryController extends Controller
{
    /**
     * Display a listing of indicator sources.
     */
    public function sources(): JsonResponse
    {
        $sources = IndicatorSource::orderBy('name', 'asc')->get();

        return response()->json([
            'sources' => $sources,
        ]);
    }

    /**
     * Display the scraping and sync logs history.
     */
    public function history(): JsonResponse
    {
        $history = SourceHistory::with('source')
            ->orderBy('run_at', 'desc')
            ->paginate(15);

        return response()->json($history);
    }
}
