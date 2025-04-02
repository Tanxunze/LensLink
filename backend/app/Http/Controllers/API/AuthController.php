<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PhotographerProfile;
use App\Models\BanList;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:customer,photographer',
        ]);

        DB::beginTransaction();

        try{
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role
            ]);

            if($request->role === 'photographer'){
                PhotographerProfile::create([
                    'user_id' => $user->id,
                ]);
            }

            DB::commit();

            SystemLog::create([
                'user_id' => $user->id,
                'type' => 'user',
                'action' => 'User registered',
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user
            ],201);

        }catch (\Exception $exception){
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $exception->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $remember = $request->remember ?? false;

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $ban = BanList::where('user_id', $user->id)
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->first();

        if ($ban) {
            $banDetails = [
                'reason' => $ban->reason,
                'duration' => $ban->duration,
                'expires_at' => $ban->expires_at ? $ban->expires_at->toDateTimeString() : 'permanent'
            ];

            SystemLog::create([
                'user_id' => $user->id,
                'type' => 'auth',
                'action' => 'Login attempted by banned user',
                'ip_address' => $request->ip(),
                'details' => json_encode($banDetails)
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended',
                'banned' => true,
                'ban_details' => $banDetails
            ], 403);
        }

        if ($user->isPhotographer()) {
            $user->load('photographerProfile');
        }

        $user->tokens()->delete();

        $tokenName = 'auth_token';
        $tokenExpiration = $remember ? now()->addDays(30) : now()->addHours(24);

        $token = $user->createToken($tokenName, ['*'], $tokenExpiration)->plainTextToken;

        if ($remember) {
            $user->remember_token = Str::random(60);
            $user->save();
        }

        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'auth',
            'action' => 'User logged in',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user,
            'expires_at' => $tokenExpiration->toDateTimeString(),
            'remember' => $remember
        ]);
    }

    public function logout(Request $request)
    {
        SystemLog::create([
            'user_id' => $request->user()->id,
            'type' => 'auth',
            'action' => 'User logged out',
            'ip_address' => $request->ip()
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function verify(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8',
            'new_password_confirmation' => 'required|same:new_password'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'validation failure',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        SystemLog::create([
            'user_id' => $user->id,
            'type' => 'user',
            'action' => 'Password changed',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}
