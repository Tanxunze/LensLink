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
        $query = Booking::with(['photographer', 'customer', 'service']);

        if ($user->role === 'photographer') {
            $query->where('photographer_id', $user->photographerProfile->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('booking_date', 'desc')->get();

        return response()->json($bookings);
    }

    public function show($id)
    {
        $booking = Booking::with(['photographer', 'customer', 'service'])->findOrFail($id);
        $user = Auth::user();

        // Check if user has access to this booking
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
            'notes' => 'nullable|string'
        ]);

        // Verify service belongs to the photographer
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
            'status' => 'pending'
        ]);

        return response()->json($booking, 201);
    }

    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);
        $user = Auth::user();

        // Check if user has access to this booking
        if (($user->role === 'photographer' && $user->photographerProfile->id != $booking->photographer_id) ||
            ($user->role === 'customer' && $user->id != $booking->customer_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if booking can be cancelled
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Cannot cancel booking with status: ' . $booking->status], 400);
        }

        $booking->status = 'cancelled';
        $booking->cancelled_by = $user->role;
        $booking->cancelled_at = now();
        $booking->save();

        return response()->json($booking);
    }
}
