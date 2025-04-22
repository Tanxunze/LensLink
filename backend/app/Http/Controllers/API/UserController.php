<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function getProfile()
    {
        $user = Auth::user();
        $user->favorites_count = $user->favorites()->count();
        $user->bookings_count = $user->bookings()->count();
        $user->reviews_count = $user->reviews()->count();

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }

        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function updateProfileImage(Request $request)
    {
        if (!$request->hasFile('image')) {
            return response()->json([
                'message' => 'No files uploaded',
                'errors' => ['image' => ['No files are uploaded']]
            ], 422);
        }

        $file = $request->file('image');
        if (!$file->isValid()) {
            return response()->json([
                'message' => 'File upload failed',
                'errors' => ['image' => ['Corrupted files or interrupted uploads']]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|file|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'validation failure',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();

            $directoryPath = 'images/profiles';
            $fullDirectoryPath = public_path($directoryPath);

            if (!file_exists($fullDirectoryPath)) {
                mkdir($fullDirectoryPath, 0777, true);
            }

            if ($user->profile_image && !str_contains($user->profile_image, 'default-avatar')) {
                $oldFilename = basename(parse_url($user->profile_image, PHP_URL_PATH));
                $oldPath = public_path('images/profiles/' . $oldFilename);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $file->move($fullDirectoryPath, $filename);

            $imageUrl = url('/api/images/' . $filename);
            $user->profile_image = $imageUrl;
            $user->save();

            return response()->json([
                'message' => 'Avatar updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('Image upload exception', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Server error when processing images',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    public function getImage($filename)
    {
        if (str_starts_with($filename, 'portfolio_')) {
            $path = public_path('images/portfolios/' . $filename);
        } elseif (str_starts_with($filename, 'service_')) {
            $path = public_path('images/services/' . $filename);
        } else {
            $path = public_path('images/profiles/' . $filename);
        }

        if (!file_exists($path)) {
            $potentialPaths = [
                public_path('images/' . $filename),
                public_path('images/profiles/' . $filename),
                public_path('images/portfolios/' . $filename),
                public_path('images/services/' . $filename),
            ];

            foreach ($potentialPaths as $potentialPath) {
                if (file_exists($potentialPath)) {
                    $path = $potentialPath;
                    break;
                }
            }

            if (!file_exists($path)) {
                return response()->json(['error' => 'Image not found'], 404);
            }
        }

        $type = mime_content_type($path);
        return response()->file($path, ['Content-Type' => $type]);
    }

}
