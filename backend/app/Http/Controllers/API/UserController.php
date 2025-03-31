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
                'message' => '没有上传文件',
                'errors' => ['image' => ['没有文件被上传']]
            ], 422);
        }

        $file = $request->file('image');
        if (!$file->isValid()) {
            return response()->json([
                'message' => '文件上传失败',
                'errors' => ['image' => ['文件损坏或上传中断']]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|file|image|max:5120', // 5MB限制
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => '验证失败',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();

            // 生成唯一文件名 - 注意我们只保存文件名，不包含路径
            $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();

            // 定义目录路径
            $directoryPath = 'images/profiles';
            $fullDirectoryPath = public_path($directoryPath);

            // 创建目录(如果不存在)
            if (!file_exists($fullDirectoryPath)) {
                mkdir($fullDirectoryPath, 0777, true);
            }

            // 删除旧图片(如果存在且不是默认图片)
            if ($user->profile_image && !str_contains($user->profile_image, 'default-avatar')) {
                // 从URL提取文件名部分
                $oldFilename = basename(parse_url($user->profile_image, PHP_URL_PATH));
                $oldPath = public_path('images/profiles/' . $oldFilename);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            // 移动文件到目标目录
            $file->move($fullDirectoryPath, $filename);

            // 设置图片URL - 使用API端点
            $imageUrl = url('/api/images/' . $filename);

            // 更新用户资料
            $user->profile_image = $imageUrl;
            $user->save();

            return response()->json([
                'message' => '头像更新成功',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('图片上传异常', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => '服务器处理图片时出错',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }

    public function getImage($filename)
    {
        // 构建图片完整路径
        $path = public_path('images/profiles/' . $filename);

        // 检查文件是否存在
        if (!file_exists($path)) {
            return response()->json(['error' => '图片不存在'], 404);
        }

        // 确定文件的MIME类型
        $type = mime_content_type($path);

        // 返回图片内容
        return response()->file($path, ['Content-Type' => $type]);
    }

}
