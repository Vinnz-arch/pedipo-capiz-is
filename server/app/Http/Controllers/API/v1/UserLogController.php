<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, User $user)
    {
        $perPage = $request->query('per_page', 10);
        
        $logs = $user->logs()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($logs);
    }
}
