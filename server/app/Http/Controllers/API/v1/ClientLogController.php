<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientLogController extends Controller
{
    /**
     * Display a listing of logs for a specific client.
     */
    public function index(Request $request, Client $client)
    {
        $perPage = $request->query('per_page', 10);
        
        $logs = $client->logs()
            ->latest()
            ->paginate($perPage);

        return response()->json($logs);
    }
}
