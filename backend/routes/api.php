<?php

use App\Http\Controllers\API\ServiceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

//public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/photographers', [App\Http\Controllers\API\PhotographerController::class, 'index']);
Route::get('/photographers/{id}', [App\Http\Controllers\API\PhotographerController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::get('/photographers/{id}/services', [ServiceController::class, 'photographerServices']);

//private routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);

    Route::get('/user/profile', function () {
        return auth()->user();
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Service management (for photographers)
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
});
