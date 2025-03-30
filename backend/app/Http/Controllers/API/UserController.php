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

    /**
     * 更新用户头像
     *
     * @param Request $request
     * @return JsonResponse|\Illuminate\Http\JsonResponse
     */
    public function updateProfileImage(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => '验证失败',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // 一、处理旧文件 (安全地推断和删除)
            if ($user->profile_image && !str_contains($user->profile_image, 'default-avatar')) {
                try {
                    // 从URL中安全提取文件名
                    $oldFileName = basename(parse_url($user->profile_image, PHP_URL_PATH));

                    // 构建正确的存储键格式 (始终使用标准格式)
                    $oldStorageKey = 'profile-images/' . $oldFileName;

                    // 尝试删除，但不阻断流程
                    try {
                        if (Storage::disk('r2')->exists($oldStorageKey)) {
                            Storage::disk('r2')->delete($oldStorageKey);
                            \Log::info("已删除旧头像: {$oldStorageKey}");
                        }
                    } catch (\Exception $e) {
                        // 仅记录错误，不中断流程
                        \Log::warning("无法删除旧头像: {$e->getMessage()}");
                    }
                } catch (\Exception $e) {
                    \Log::warning("处理旧头像URL时出错: {$e->getMessage()}");
                }
            }

            // 二、上传新文件 (使用标准、安全的命名约定)
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension());

            // 安全的文件名 (时间戳 + 随机字符串)
            $fileName = time() . '_' . Str::random(10) . '.' . $extension;
            $storageKey = 'profile-images/' . $fileName;

            // 直接从临时文件读取并上传，避免内存问题
            $stream = fopen($file->getRealPath(), 'r');
            $uploadSuccess = Storage::disk('r2')->put($storageKey, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }

            if (!$uploadSuccess) {
                throw new \Exception("无法上传文件到存储");
            }

            // 三、生成访问URL
            $url = Storage::disk('r2')->url($storageKey);

            // 四、更新数据库
            $user->profile_image = $url;
            $user->save();

            // 五、返回成功响应
            return response()->json([
                'message' => '头像更新成功',
                'image_url' => $url,
                'debug_info' => [
                    'storage_key' => $storageKey
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error("头像更新失败: {$e->getMessage()}", [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => '头像更新失败',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
