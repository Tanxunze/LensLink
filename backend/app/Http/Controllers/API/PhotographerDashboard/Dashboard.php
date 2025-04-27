<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\PhotographerProfile;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class Dashboard extends Controller
{
    public function index(Request $request)
    {
        $photographer_id = $request->input('photographer_id');
        $works_return=$this->getWorkAmount($photographer_id);
        $avg_rating=$this->getReviewAverage($photographer_id);
        $recent_bookings=$this->getRecentBookings($photographer_id);
        $data=[
            'success'=>true,
            'data'=>[
                'pendingOrdersCount'=>$works_return['works']['pending'],
                'activeOrdersCount'=>$works_return['works']['confirmed'],
                'totalEarnings'=>$works_return['works']['earnings'],// TODO: Total earnings -> Monthly earnings
                'recentBookings'=>$recent_bookings,
                'overallRating'=>$avg_rating
    ]
        ];
        return response()->json($data,200);
    }

    public function monthlyEarnings(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->photographerProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Photographer not found',
                'amount' => 0
            ], 404);
        }

        $photographer_id = $user->photographerProfile->id;

        $firstDayOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $lastDayOfMonth = Carbon::now()->endOfMonth()->toDateString();

        $totalAmount = Booking::where('photographer_id', $photographer_id)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$firstDayOfMonth, $lastDayOfMonth])
            ->sum('total_amount');

        return response()->json([
            'success' => true,
            'amount' => number_format($totalAmount, 2, '.', '')
        ]);
    }

    private function getWorkAmount(int $photographer_id): array
    {
        $works=Booking::where('photographer_id',$photographer_id)->get();
        $count=0;
        $pending_work=0;
        $confirmed_work=0;
        $earnings=0;
        foreach($works as $work)
        {
            if($work->photographer_id==$photographer_id)
            {
                switch($work->status)
                {
                    case 'confirmed': $confirmed_work++; break;
                    case 'completed': $earnings+=Service::where('id',$work->service_id)->value('price'); break;
                    case 'pending': $pending_work++; break;
                    default:
                        break;
                }
                $count++;
            }
        }
        return [
            'work_amount'=>$count,
            'works'=>[
                'pending'=>$pending_work,
                'confirmed'=>$confirmed_work,
                'earnings'=>$earnings
            ]
        ];
    }

    private function getReviewAverage(int $photographer_id): float
    {
        return PhotographerProfile::where('id',$photographer_id)->value('average_rating');
    }

    private function getRecentBookings(int $photographer_id): array
    {
        $bookings=Booking::where('booking_date','>=',Carbon::now()->subDays(30))
            ->where('photographer_id',$photographer_id)
            ->get();
        $results=[];
        foreach($bookings as $booking)
        {
            $return_booking=[];
            $return_booking['id']=$booking->id;
            $return_booking['client']=[
                'id'=>$booking->customer_id,
                'name'=>User::where('id',$booking->customer_id)->value('name'),
            ];
            $return_booking['service']=[
                'id'=>$booking->service_id,
                'name'=>Service::where('id',$booking->service_id)->value('name'),
            ];
            $return_booking['booking_date']=$booking->booking_date;
            $return_booking['status']=$booking->status;
            $return_booking['total_amount']=$booking->total_amount;
            $results[]=$return_booking;
        }
        return $results;
    }

    public function show(Request $request)
    {
        $photographer_id=$request->user()->photographerProfile->id;

        $photographer = PhotographerProfile::with(['user', 'categories', 'services', 'portfolioItems'])
            ->findOrFail($photographer_id);

        $services = $photographer->services->map(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'price' => $service->price,
                'unit' => $service->unit,
                'duration' => $service->duration,
                'is_featured' => $service->is_featured,
                'features' => $service->features->pluck('feature')
            ];
        });

        $portfolio = $photographer->portfolioItems->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'image' => $item->image_path,
                'category' => $item->category->name ?? null,
                'featured' => $item->featured
            ];
        });

        $reviews = DB::table('reviews')
            ->join('users', 'reviews.customer_id', '=', 'users.id')
            ->where('reviews.photographer_id', $photographer_id)
            ->where('reviews.is_published', true)
            ->select('reviews.*', 'users.name as customer_name', 'users.profile_image as customer_image')
            ->limit(5)
            ->get();

        return response()->json([
            'id' => $photographer->id,
            'name' => $photographer->user->name,
            'email' => $photographer->user->email,
            'phone'=>$photographer->user->phone,
            'profile_image' => $photographer->user->profile_image,
            'banner_image' => $photographer->banner_image,
            'bio' => $photographer->user->bio,
            'specialization' => $photographer->specialization,
            'location' => $photographer->location,
            'experience_years' => $photographer->experience_years,
            'photoshoot_count' => $photographer->photoshoot_count,
            'created_at' => $photographer->created_at,
            'rating' => $photographer->average_rating,
            'review_count' => $photographer->review_count,
            'starting_price' => $photographer->starting_price,
            'categories' => $photographer->categories->pluck('name'),
            'services' => $services,
            'portfolio' => $portfolio,
            'reviews' => $reviews,
        ]);
    }

    public function recentBookings(Request $request)
    {
        $photographer_id=$request->user()->photographerProfile->id;

        $bookings=DB::table('bookings')
            ->join('users','bookings.customer_id','=','users.id')
            ->join('services','bookings.service_id','=','services.id')
            ->where('bookings.photographer_id',$photographer_id)
            ->select('bookings.*','users.name as customer_name','users.profile_image as customer_image','services.name as service_name')
            ->get();

        $bookings = $bookings->map(function($booking) {
            $booking->customer = (object)[
                'id' => $booking->customer_id,
                'name' => $booking->customer_name,
                'image' => $booking->customer_image
            ];
            return $booking;
        });

        return response()->json($bookings);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $photographer = $user->photographerProfile;

        if (!$photographer) {
            return response()->json([
                'success' => false,
                'message' => 'No photographer information found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'specialization' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'validation failure',
                'errors' => $validator->errors()
            ], 422);
        }
        if ($request->has('name')) {
            $user->name = $request->input('name');
        }

        if ($request->has('email')) {
            $user->email = $request->input('email');
        }

        if ($request->has('phone')) {
            $user->phone = $request->input('phone');
        }

        if ($request->has('bio')) {
            $user->bio = $request->input('bio');
        }

        $user->save();

        if ($request->has('specialization')) {
            $photographer->specialization = $request->input('specialization');
        }

        if ($request->has('location')) {
            $photographer->location = $request->input('location');
        }

        if ($request->has('experience_years')) {
            $photographer->experience_years = $request->input('experience_years');
        }

        $photographer->save();

        if ($request->has('categories')) {
            $photographer->categories()->detach();

            if (count($request->input('categories')) > 0) {
                $photographer->categories()->attach($request->input('categories'));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Personal Information Update Successful',
            'data' => [
                'user' => $user,
                'photographer' => $photographer->load('categories')
            ]
        ]);
    }

    public function updateProfileImage(Request $request)
    {
        $user = $request->user();

        if (!$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'message' => 'No files were uploaded',
                'errors' => ['image' => ['No files were uploaded']]
            ], 422);
        }

        $file = $request->file('image');
        if (!$file->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed',
                'errors' => ['image' => ['Corrupted files or interrupted uploads']]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|file|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'validation failure',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();

            $directoryPath = 'images/profiles';
            $fullDirectoryPath = public_path($directoryPath);

            if (!file_exists($fullDirectoryPath)) {
                mkdir($fullDirectoryPath, 0777, true);
            }

            if ($user->profile_image && !str_contains($user->profile_image, 'default-')) {
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
                'success' => true,
                'message' => 'Avatar updated successfully',
                'profile_image' => $imageUrl
            ]);
        } catch (\Exception $e) {
            \Log::error('Image upload exception', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Server error when processing images',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
