<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Booking::with(['photographer.user', 'customer', 'service']);


        if ($user->role === 'photographer') {
            $query->where('photographer_id', $user->photographerProfile->id);
        } else {
            $query->where('customer_id', $user->id);
        }


        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }


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


        $sortField = $request->input('sort_field', 'booking_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);


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
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:255',
            'review' => 'required|string',
            'service_type' => 'required|string|max:255',
            'service_date' => 'required|date',
            'booking_id' => 'required|exists:bookings,id'
        ]);

        // Verify this is a completed booking and belongs to this user/photographer
        $booking = Booking::where('id', $request->booking_id)
            ->where('customer_id', Auth::id())
            ->where('photographer_id', $request->photographer_id)
            ->where('status', 'completed')
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'You can only review photographers for completed bookings'], 403);
        }

        // Check if a review already exists for this booking
        $existingReview = Review::where('booking_id', $request->booking_id)->first();
        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this booking'], 409);
        }

        $review = Review::create([
            'booking_id' => $request->booking_id,
            'photographer_id' => $request->photographer_id,
            'customer_id' => Auth::id(),
            'rating' => $request->rating,
            'title' => $request->title,
            'review' => $request->review,
            'service_type' => $request->service_type,
            'service_date' => $request->service_date
        ]);

        return response()->json($review, 201);
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

        if ($request->has('status')) {
            $status = $request->status;

            if ($status === 'active') {
                $query->whereNotIn('status', ['completed', 'cancelled']);
            } else {
                $query->where('status', $status);
            }
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

    public function reschedule(Request $request, $id): \Illuminate\Http\JsonResponse
    {

        $validator = Validator::make($request->all(), [
            'booking_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }


        $booking = Booking::findOrFail($id);


        if ($booking->customer_id != auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to reschedule this booking'
            ], 403);
        }


        $allowedStatuses = ['pending', 'confirmed'];
        if (!in_array($booking->status, $allowedStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Booking cannot be rescheduled in its current status'
            ], 400);
        }


        $oldDate = $booking->booking_date;
        $oldStartTime = $booking->start_time;

        $booking->booking_date = $request->booking_date;
        $booking->start_time = $request->start_time;

        if ($request->has('end_time')) {
            $booking->end_time = $request->end_time;
        }


        $rescheduleNote = "Booking rescheduled from $oldDate $oldStartTime to {$request->booking_date} {$request->start_time}";
        if ($request->has('notes') && !empty($request->notes)) {
            $rescheduleNote .= ". Reason: " . $request->notes;
        }


        if (!empty($booking->notes)) {
            $booking->notes = $booking->notes . "\n\n" . $rescheduleNote;
        } else {
            $booking->notes = $rescheduleNote;
        }


        $booking->status = 'rescheduled';
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking rescheduled successfully',
            'booking' => $booking
        ]);
    }
}
