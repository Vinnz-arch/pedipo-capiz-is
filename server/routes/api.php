<?php

use App\Http\Controllers\API\v1\AuthController;
use App\Http\Controllers\API\v1\ClientAuthController;
use App\Http\Controllers\API\v1\ClientController;
use App\Http\Controllers\API\v1\ClientLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// This is the login route
// We use 'throttle:5,1' to allow only 5 attempts per minute (Security!)
Route::post('/v1/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/v1/client/login', [ClientAuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/v1/logout', [AuthController::class, 'logout']);
    Route::post('/v1/client/logout', [ClientAuthController::class, 'logout']);

    // Clients CRUD
    Route::apiResource('/v1/clients', ClientController::class);
    Route::get('/v1/clients/{client}/logs', [ClientLogController::class, 'index']);
});
