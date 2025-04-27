<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CustomerMessageController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\GoogleAuthController;
use App\Http\Controllers\API\PhotographerDashboard\Bookings;
use App\Http\Controllers\API\PhotographerDashboard\Dashboard;
use App\Http\Controllers\API\PhotographerDashboard\Messages;
use App\Http\Controllers\API\PhotographerDashboard\Portfolio;
use App\Http\Controllers\API\PhotographerDashboard\Reviews;
use App\Http\Controllers\API\PhotographerDashboard\Services;
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
Route::get('/customers/{id}', [UserController::class, 'getCustomerProfile']);

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

    // Customer-to-customer messaging routes
    Route::post('/customer-messages/send-request', [CustomerMessageController::class, 'sendRequest']);
    Route::get('/customer-messages/pending-requests', [CustomerMessageController::class, 'getPendingRequests']);
    Route::get('/customer-messages/pending-requests/count', [CustomerMessageController::class, 'getPendingRequestsCount']);
    Route::post('/customer-messages/accept-request/{requestId}', [CustomerMessageController::class, 'acceptRequest']);
    Route::post('/customer-messages/reject-request/{requestId}', [CustomerMessageController::class, 'rejectRequest']);
    Route::get('/customer-messages/conversations', [CustomerMessageController::class, 'getConversations']);
    Route::get('/customer-messages/conversation/{conversationId}', [CustomerMessageController::class, 'getConversationMessages']);
    Route::post('/customer-messages/send', [CustomerMessageController::class, 'sendMessage']);

    // Bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/count', [BookingController::class, 'count']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::put('/bookings/{id}/reschedule', [BookingController::class, 'reschedule']);
    Route::get('/earnings/chart', [BookingController::class, 'earnings']);

    // Photographer dashboard
    Route::post('/photographer/dashboard', [Dashboard::class, 'index']);
    Route::post('/photographer/portfolio', [Portfolio::class, 'index']);
    Route::post('/photographer/portfolio/image', [Portfolio::class, 'uploadPortfolioImage']);
    Route::post('/photographer/profile',[Dashboard::class,'show']);
    Route::post('/photographer/profile/recent-bookings',[Dashboard::class,'recentBookings']);
    Route::post('/photographer/portfolio/create', [Portfolio::class, 'store']);
    Route::post('/photographer/portfolio/update', [Portfolio::class, 'update']);
    Route::post('photographer/bookings-details',[Bookings::class,'index']);
    Route::post('photographer/services',[Services::class,'index']);
    Route::post('photographer/reviews/details',[Reviews::class,'index']);
    Route::post('photographer/messages',[Messages::class,'index']);
    Route::post('photographer/messages/send',[Messages::class,'send']);
    Route::post('/photographer/profile/update',[Dashboard::class,'update']);
    Route::post('/photographer/profile/image',[Dashboard::class,'updateProfileImage']);
    Route::get('/photographer/bookings/{id}', [Bookings::class, 'show']);
    Route::put('/photographer/bookings/{id}', [Bookings::class, 'update']);
    Route::post('/photographer/reviews/reply', [Reviews::class, 'reply']);
    Route::post('photographer/reviews/item',[Reviews::class,'getReview']);
    Route::post('/photographer/messages',[Messages::class,'show']);
    Route::get('/photographer/services/edit/{id}', [Services::class, 'edit']);
    Route::put('/photographer/services/edit/{id}', [Services::class, 'update']);
    Route::post('/photographer/services/{id}/featured', [Services::class, 'updateFeatureStatus']);
    Route::delete('/photographer/services/{id}/delete', [Services::class, 'destroy']);
    Route::post('/photographer/services/image', [Services::class, 'uploadServiceImage']);
    Route::get('/earnings/monthly', [Dashboard::class, 'monthlyEarnings']);

    //Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{id}', [FavoriteController::class, 'check']);

    //User profile
    Route::get('/user/profile', [UserController::class, 'getProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/profile/image', [UserController::class, 'updateProfileImage']);
    Route::post('/reports', [AdminController::class, 'createReport']);
    Route::post('/reports/review', [AdminController::class, 'createReviewReport']);

    // Admin Dashboard
    Route::prefix('admin')->group(function () {
        Route::get('/auth/check', [AdminController::class, 'checkAuth']);
        Route::get('/stats', [AdminController::class, 'getStats']);
        Route::get('/activities', [AdminController::class, 'getRecentActivities']);
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{id}', [AdminController::class, 'getUserDetails']);
        Route::post('/users/ban', [AdminController::class, 'banUser']);
        Route::get('/bans', [AdminController::class, 'getBanList']);
        Route::get('/bans/{id}', [AdminController::class, 'getBanDetails']);
        Route::delete('/bans/{id}', [AdminController::class, 'unbanUser']);
        Route::delete('/bans/user/{userId}', [AdminController::class, 'unbanUserByUserId']);
        Route::get('/comments', [AdminController::class, 'getComments']);
        Route::delete('/comments/{id}', [AdminController::class, 'deleteComment']);
        Route::put('/comments/{id}/visibility', [AdminController::class, 'toggleCommentVisibility']);
        Route::get('/comments/{id}', [AdminController::class, 'getCommentDetails']);
        Route::get('/messages', [AdminController::class, 'getMessages']);
        Route::delete('/messages/{id}', [AdminController::class, 'deleteMessage']);
        Route::get('/messages/{id}', [AdminController::class, 'getMessageDetails']);
        Route::get('/logs', [AdminController::class, 'getLogs']);
        Route::get('/logs/{id}', [AdminController::class, 'getLogDetails']);
        Route::delete('/logs/clear', [AdminController::class, 'clearLogs']);
        Route::get('/reports', [AdminController::class, 'getReports']);
        Route::get('/reports/{id}', [AdminController::class, 'getReportDetails']);
        Route::post('/reports/handle', [AdminController::class, 'handleReport']);
    });
});

