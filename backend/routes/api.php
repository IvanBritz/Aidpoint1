<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now()->toDateTimeString(),
        'csrf_token' => csrf_token(),
        'session_id' => session()->getId(),
    ]);
});

// Simple registration test without complex logic
Route::post('/test-register', function (Request $request) {
    return response()->json([
        'message' => 'Test registration endpoint reached',
        'data' => $request->all(),
        'headers' => $request->headers->all(),
    ]);
});

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
    Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);
});

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::post('/auth/change-password', [\App\Http\Controllers\AuthController::class, 'changePassword']);
    
    // User routes
    Route::get('/profile', [\App\Http\Controllers\UserController::class, 'profile']);
    Route::put('/profile', [\App\Http\Controllers\UserController::class, 'updateProfile']);
    
    // Project Director only routes
    Route::middleware('role:project_director')->group(function () {
        // Employee management
        Route::get('/employees/privileges/list', [\App\Http\Controllers\EmployeeController::class, 'privileges']);
        Route::get('/employees/positions/list', [\App\Http\Controllers\PositionController::class, 'index']);
        Route::post('/employees/positions', [\App\Http\Controllers\PositionController::class, 'store']);
        Route::put('/employees/positions/{id}', [\App\Http\Controllers\PositionController::class, 'update']);
        Route::delete('/employees/positions/{id}', [\App\Http\Controllers\PositionController::class, 'destroy']);
        Route::apiResource('employees', \App\Http\Controllers\EmployeeController::class);
        
        // Other project director routes
        Route::apiResource('beneficiaries', \App\Http\Controllers\BeneficiaryController::class);
        Route::apiResource('subscriptions', \App\Http\Controllers\SubscriptionController::class);
        Route::get('/plans', [\App\Http\Controllers\PlanController::class, 'index']);
    });
    
    // Beneficiary routes
    Route::middleware('role:beneficiary')->group(function () {
        Route::get('/my-profile', [\App\Http\Controllers\BeneficiaryController::class, 'myProfile']);
        Route::put('/my-profile', [\App\Http\Controllers\BeneficiaryController::class, 'updateMyProfile']);
    });
});
