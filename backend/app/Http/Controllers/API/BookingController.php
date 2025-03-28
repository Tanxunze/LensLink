<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Booking::with(['photographer.user', 'customer', 'service']);

        // 根据用户角色获取相应的预订
        if ($user->role === 'photographer') {
            $query->where('photographer_id', $user->photographerProfile->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        // 按状态筛选
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // 搜索功能
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('photographer.user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('service', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('booking_date', 'like', "%{$search}%");
            });
        }

        // 排序 (默认按预订日期降序)
        $sortField = $request->input('sort_field', 'booking_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // 分页
        $perPage = $request->input('limit', 10);
        $page = $request->input('page', 1);
        $bookings = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'bookings' => $bookings->items(),
            'pagination' => [
                'total' => $bookings->total(),
                'per_page' => $bookings->perPage(),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'from' => $bookings->firstItem(),
                'to' => $bookings->lastItem(),
                'total_pages' => ceil($bookings->total() / $bookings->perPage())
            ]
        ]);
    }

    public function show($id)
    {
        $booking = Booking::with(['photographer.user', 'customer', 'service'])->findOrFail($id);
        $user = Auth::user();

        // 检查用户是否有权限访问此预订
        if (($user->role === 'photographer' && $user->photographerProfile->id != $booking->photographer_id) ||
            ($user->role === 'customer' && $user->id != $booking->customer_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    public function store(Request $request)
    {
        $request->validate([
            'photographer_id' => 'required|exists:photographer_profiles,id',
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'location' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'total_amount' => 'required|numeric'
        ]);

        $service = Service::findOrFail($request->service_id);
        if ($service->photographer_id != $request->photographer_id) {
            return response()->json(['message' => 'Service does not belong to this photographer'], 400);
        }

        $booking = Booking::create([
            'photographer_id' => $request->photographer_id,
            'customer_id' => Auth::id(),
            'service_id' => $request->service_id,
            'booking_date' => $request->booking_date,
            'start_time' => $request->start_time,
            'location' => $request->location,
            'notes' => $request->notes,
            'total_amount' => $request->total_amount,
            'status' => 'pending'
        ]);

        return response()->json($booking, 201);
    }

    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);
        $user = Auth::user();

        if (($user->role === 'photographer' && $user->photographerProfile->id != $booking->photographer_id) ||
            ($user->role === 'customer' && $user->id != $booking->customer_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Cannot cancel booking with status: ' . $booking->status], 400);
        }

        $booking->status = 'cancelled';
        $booking->save();

        return response()->json($booking);
    }

    public function count(Request $request)
    {
        $user = Auth::user();
        $query = Booking::query();

        if ($user->role === 'photographer') {
            $query->where('photographer_id', $user->photographerProfile->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $count = $query->count();
        return response()->json(['count' => $count]);
    }

    public function earnings(Request $request)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $days = $request->days;
        $user = Auth::user();
        $photographer_id = $user->photographerProfile->id;

        // Get current date and the date $days ago
        $endDate = today();
        $startDate = today()->subDays($days - 1);

        // Generate all dates in the range for complete data set
        $dateRange = [];
        $currentDate = clone $startDate;

        while ($currentDate->lte($endDate)) {
            $dateRange[$currentDate->format('Y-m-d')] = 0;
            $currentDate->addDay();
        }

        // Query to get earnings data grouped by date
        $bookings = Booking::where('photographer_id', $photographer_id)
            ->where('status', 'completed')
            ->get();

        // Fill in the data array with actual earnings
        $earnings = $dateRange;
        foreach ($bookings as $booking) {
            $bookingDate = $booking->created_at->format('Y-m-d');
            if (isset($earnings[$bookingDate])) {
                $earnings[$bookingDate] += (float) $booking->service->price;
            }
        }

        // Prepare data in format expected by the chart
        $labels = array_keys($earnings);
        $values = array_values($earnings);

        return response()->json([
            'labels' => $labels,
            'values' => $values,
        ]);
    }
}
