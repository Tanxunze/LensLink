<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class Reviews extends Controller
{
    public function index(Request $request)
    {
        $photographer_id = $request->user()->photographerProfile->id;
        $allReviews=Review::where('photographer_id', $photographer_id)->get();

        $count_5=0;
        $count_4=0;
        $count_3=0;
        $count_2=0;
        $count_1=0;
        foreach($allReviews as $review)
        {
            if(ceil($review->rating)==5)
            {
                $count_5++;
            }
            elseif(ceil($review->rating)==4)
            {
                $count_4++;
            }
            elseif(ceil($review->rating)==3)
            {
                $count_3++;
            }
            elseif(ceil($review->rating)==2)
            {
                $count_2++;
            }
            elseif(ceil($review->rating)==1)
            {
                $count_1++;
            }
        }

        $result=[
            'stats'=>[
                'average_rating'=>round(Review::where('photographer_id', $photographer_id)->avg('rating'),1),
                'total_reviews'=>Review::where('photographer_id', $photographer_id)->count(),
                'rating_distribution'=>[
                    '5'=>$count_5,
                    '4'=>$count_4,
                    '3'=>$count_3,
                    '2'=>$count_2,
                    '1'=>$count_1
                ]
            ],
            'reviews'=>$allReviews,
            'total_pages'=>[
                'current_page'=>$request->input('page', 1),
                'total_pages'=>ceil(Review::where('photographer_id', $photographer_id)->count() / 10)
            ]
        ];
        return response()->json($result, 200);
    }

    public function getReview(Request $request)
    {
        $id=$request->input("id");
        $result=Review::where('id', $id)->first();
        $result['customer']=User::where('id',$result['customer_id'])->first();
        return response()->json($result, 200);
    }

    public function reply(Request $request)
    {
        $id=$request->input('id');
        // 验证请求数据
        $validator = Validator::make($request->all(), [
            'reply' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // 获取当前认证用户的摄影师ID
        $photographer_id = $request->user()->photographerProfile->id;

        // 查找评论
        $review = Review::where('id', $id)
                        ->where('photographer_id', $photographer_id)
                        ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot find the review or unauthorized',
            ], 404);
        }

        // 判断是更新还是新建回复
        $isUpdate = !empty($review->reply);

        // 更新回复内容和回复时间
        $review->reply = $request->input('reply');
        $review->reply_date = now();
        $review->save();

        return response()->json([
            'success' => true,
            'message' => $isUpdate ? 'update' : 'submit',
            'is_update' => $isUpdate,
            'review' => $review
        ], 200);
    }
}
