<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        \Config::set('services.google.guzzle', ['verify' => false]);//avoid the cert vaildation

        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        \Config::set('services.google.guzzle', ['verify' => false]);

        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(rand(100000, 999999)),
                    'profile_image' => $googleUser->avatar
                ]);
            } else {
                $user->update([
                    'google_id' => $googleUser->id,
                    'profile_image' => $user->profile_image ?: $googleUser->avatar
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;
            $frontendUrl = config('app.frontend_url', 'http://localhost:5500');
            return redirect($frontendUrl . 'pages/auth/login.html?token=' . $token . '&user=' . urlencode(json_encode([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ])));

        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5500');
            return redirect($frontendUrl . 'pages/auth/login.html?error=' . urlencode('Login failed: ' . $e->getMessage()));
        }
    }
}
