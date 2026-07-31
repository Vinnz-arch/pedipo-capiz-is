<?php

use App\Http\Controllers\API\v1\AuthController;
use App\Http\Controllers\API\v1\UserAuthController;
use App\Http\Controllers\API\v1\UserController;
use App\Http\Controllers\API\v1\UserLogController;
use App\Http\Controllers\API\v1\OpportunityController;
use App\Http\Controllers\API\v1\InquiryController;
use App\Http\Controllers\API\v1\LandingPageController;
use App\Http\Controllers\API\v1\NewsController;
use App\Http\Controllers\API\v1\MunicipalityController;
use App\Http\Controllers\API\v1\MsmeAssistanceRequestController;
use App\Http\Controllers\API\v1\ComparisonController;
use App\Http\Controllers\API\v1\IndicatorController;
use App\Http\Controllers\API\v1\SourceHistoryController;
use App\Http\Controllers\API\v1\AdminManualUploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// This is the login route
// We use 'throttle:5,1' to allow only 5 attempts per minute (Security!)
Route::post('/v1/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/v1/user/login', [UserAuthController::class, 'login'])->middleware('throttle:5,1');

// Public/Dashboard read endpoints
Route::get('/v1/opportunities', [OpportunityController::class, 'index']);
Route::get('/v1/portal/opportunities', [OpportunityController::class, 'publicOpportunities']);
Route::post('/v1/portal/inquiries', [InquiryController::class, 'store']);
Route::get('/v1/landing-settings', [LandingPageController::class, 'getSettings']);

// Public News Read
Route::get('/v1/news', [NewsController::class, 'index']);
Route::get('/v1/news/{slugOrId}', [NewsController::class, 'show']);
Route::post('/v1/news/{id}/comments', [NewsController::class, 'storeComment']);

// Public Municipalities Read
Route::get('/v1/municipalities', [MunicipalityController::class, 'index']);

// Comparison Tool Routes
Route::get('/v1/comparison', [ComparisonController::class, 'index']);
Route::get('/v1/latest-updates', [ComparisonController::class, 'latestUpdates']);
Route::get('/v1/indicators', [IndicatorController::class, 'index']);
Route::get('/v1/indicators/{id}', [IndicatorController::class, 'show']);
Route::get('/v1/indicator-sources', [SourceHistoryController::class, 'sources']);
Route::get('/v1/source-history', [SourceHistoryController::class, 'history']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/v1/logout', [AuthController::class, 'logout']);
    Route::post('/v1/user/logout', [UserAuthController::class, 'logout']);

    // Users CRUD
    Route::apiResource('/v1/users', UserController::class);
    Route::get('/v1/users/{user}/logs', [UserLogController::class, 'index']);

    // Opportunities CRUD & Sync
    Route::post('/v1/opportunities/sync', [OpportunityController::class, 'syncPortal']);
    Route::post('/v1/opportunities', [OpportunityController::class, 'store']);
    Route::put('/v1/opportunities/{opportunity}', [OpportunityController::class, 'update']);
    Route::post('/v1/opportunities/{opportunity}', [OpportunityController::class, 'update']); // for multipart form-data
    Route::delete('/v1/opportunities/{opportunity}', [OpportunityController::class, 'destroy']);

    // Inquiries CRUD
    Route::apiResource('/v1/inquiries', InquiryController::class);

    // Landing Page CMS
    Route::put('/v1/landing-settings', [LandingPageController::class, 'updateSettings']);
    Route::post('/v1/landing-settings', [LandingPageController::class, 'updateSettings']);

    // News CRUD (Admin only)
    Route::post('/v1/news', [NewsController::class, 'store']);
    Route::put('/v1/news/{id}', [NewsController::class, 'update']);
    Route::post('/v1/news/{id}', [NewsController::class, 'update']); // for multipart form-data
    Route::delete('/v1/news/{id}', [NewsController::class, 'destroy']);

    // Municipalities CRUD
    Route::post('/v1/municipalities', [MunicipalityController::class, 'store']);
    Route::post('/v1/municipalities/{municipality}', [MunicipalityController::class, 'update']);
    Route::delete('/v1/municipalities/{municipality}', [MunicipalityController::class, 'destroy']);

    // MSME Assistance Requests
    Route::get('/v1/msme-requests', [MsmeAssistanceRequestController::class, 'index']);
    Route::post('/v1/msme-requests', [MsmeAssistanceRequestController::class, 'store']);
    Route::get('/v1/msme-requests/{id}', [MsmeAssistanceRequestController::class, 'show']);
    Route::put('/v1/msme-requests/{id}', [MsmeAssistanceRequestController::class, 'update']);
    Route::post('/v1/msme-requests/{id}', [MsmeAssistanceRequestController::class, 'update']); // for multipart update if needed
    Route::delete('/v1/msme-requests/{id}', [MsmeAssistanceRequestController::class, 'destroy']);

    // Admin Indicator Manual Upload
    Route::post('/v1/admin/manual-upload', [AdminManualUploadController::class, 'upload']);
});
