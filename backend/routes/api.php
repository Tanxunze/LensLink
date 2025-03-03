<?php

use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\UtilityController;
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
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sort-options/{entity}', [UtilityController::class, 'getSortOptions']);
Route::get('/rating-options', [UtilityController::class, 'getRatingOptions']);

//private routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);

    Route::get('/user/profile', function () {
        return auth()->user();
    });

    // Service management (for photographers)
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);

    // Messages
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/conversations', [MessageController::class, 'getConversations']);
    Route::get('/messages/conversation/{id}', [MessageController::class, 'getConversationMessages']);
    Route::post('/messages/mark-as-read', [MessageController::class, 'markAsRead']);

    // Bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
});
