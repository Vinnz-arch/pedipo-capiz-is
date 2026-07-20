<?php

use App\Http\Controllers\API\v1\AuthController;
use App\Http\Controllers\API\v1\UserAuthController;
use App\Http\Controllers\API\v1\UserController;
use App\Http\Controllers\API\v1\UserLogController;
use App\Http\Controllers\API\v1\OpportunityController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// This is the login route
// We use 'throttle:5,1' to allow only 5 attempts per minute (Security!)
Route::post('/v1/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/v1/user/login', [UserAuthController::class, 'login'])->middleware('throttle:5,1');

// Public/Dashboard read endpoints
Route::get('/v1/opportunities', [OpportunityController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/v1/logout', [AuthController::class, 'logout']);
    Route::post('/v1/user/logout', [UserAuthController::class, 'logout']);

    // Users CRUD
    Route::apiResource('/v1/users', UserController::class);
    Route::get('/v1/users/{user}/logs', [UserLogController::class, 'index']);

    // Opportunities CRUD
    Route::post('/v1/opportunities', [OpportunityController::class, 'store']);
    Route::put('/v1/opportunities/{opportunity}', [OpportunityController::class, 'update']);
    Route::post('/v1/opportunities/{opportunity}', [OpportunityController::class, 'update']); // for multipart form-data
    Route::delete('/v1/opportunities/{opportunity}', [OpportunityController::class, 'destroy']);
});
