<?php

use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\GoogleAuthController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\UtilityController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

//public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/photographers', [App\Http\Controllers\API\PhotographerController::class, 'index']);
Route::get('/photographers/recommended', [App\Http\Controllers\API\PhotographerController::class, 'recommended']);
Route::get('/photographers/{id}', [App\Http\Controllers\API\PhotographerController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::get('/photographers/{id}/services', [ServiceController::class, 'photographerServices']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sort-options/{entity}', [UtilityController::class, 'getSortOptions']);
Route::get('/rating-options', [UtilityController::class, 'getRatingOptions']);
Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::get('/images/{filename}', [UserController::class, 'getImage']);

//private routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
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
    Route::post('/reviews/rating',[ReviewController::class,'show']);

    // Messages
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/conversations', [MessageController::class, 'getConversations']);
    Route::get('/messages/count', [MessageController::class, 'count']);
    Route::get('/messages/conversation/{id}', [MessageController::class, 'getConversationMessages']);
    Route::post('/messages/mark-as-read', [MessageController::class, 'markAsRead']);
    Route::post('/messages/reply', [MessageController::class, 'replyToConversation']);


    // Bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/count', [BookingController::class, 'count']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::get('/earnings/chart', [BookingController::class, 'earnings']);

    // Photographer dashboard
    Route::post('/photographer/dashboard', [App\Http\Controllers\API\PhotographerDashboard\Dashboard::class, 'index']);
    Route::post('/photographer/portfolio', [App\Http\Controllers\API\PhotographerDashboard\Portfolio::class, 'index']);
    Route::post('/photographer/profile',[\App\Http\Controllers\API\PhotographerDashboard\Dashboard::class,'show']);
    Route::post('/photographer/profile/recent-bookings',[\App\Http\Controllers\API\PhotographerDashboard\Dashboard::class,'recentBookings']);

    //Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{id}', [FavoriteController::class, 'check']);

    //User profile
    Route::get('/user/profile', [UserController::class, 'getProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/profile/image', [UserController::class, 'updateProfileImage']);

    // Admin dashboard

    // back-end stastics
    Route::get('/admin/stats', [AdminController::class, 'getStats']);

    // Get recently registered users
    Route::get('/admin/users/recent', [AdminController::class, 'getRecentUsers']);

    // Getting system logs
    Route::get('/admin/logs', [AdminController::class, 'getLogs']);

    // Get comments
    Route::get('/admin/comments', [AdminController::class, 'getComments']);

    // Delete comments
    Route::delete('/admin/comments/{id}', [AdminController::class, 'deleteComment']);

    // Ban users
    Route::post('/admin/users/{id}/ban', [AdminController::class, 'banUser']);
});

