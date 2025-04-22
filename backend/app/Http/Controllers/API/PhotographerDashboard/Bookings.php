<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Booking;

class Bookings extends Controller
{
    public function show($id, Request $request)
    {
        $booking=Booking::findOrFail($id);

        if($booking->photographer_id != $request->user()->photographerProfile->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $bookingData=$booking->toArray();
        $user_info=User::where('id', $booking->customer_id)->first();
        $bookingData['customer_name'] = $user_info->name;
        $bookingData['customer_email']= $user_info->email;
        $bookingData['customer_phone']= $user_info->phone;
        $bookingData['service_name'] = Service::where('id', $booking->service_id)->value('name');

        return response()->json($bookingData);
    }

    public function update($id, Request $request)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->photographer_id != $request->user()->photographerProfile->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'booking_date' => 'date|required',
            'booking_time' => 'required',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $booking->booking_date = $request->booking_date;
        $booking->location = $request->location;
        $booking->status = $request->status;
        $booking->notes = $request->notes;
        $booking->save();

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    public function updateStatus($id, Request $request)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->photographer_id != $request->user()->photographerProfile->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled'
        ]);

        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking->status
        ]);
    }
    //
    public function index(Request $request)
    {
        $photographer_id = $request->user()->photographerProfile->id;
        $filter = $request->input('filter');
        $status = $filter['status'] ?? 'all';
        $bookings = $this->getPhotographerBookings($photographer_id, $status);
        return response()->json([
            'message' => 'success',
            'bookings' => $bookings
        ]);
    }

    private function getPhotographerBookings(int $photographer_id, string $status)
    {
        $query = Booking::where("photographer_id", $photographer_id);
        if ($status !== 'all') {
            $query->where('status', $status);
        }
        $bookings = $query->get();

        $results = [];
        foreach ($bookings as $booking) {
            $return_data = $booking->toArray();
            $return_data['customer_name'] = User::where('id', $booking->customer_id)->value('name');
            $return_data['service_name'] = Service::where('id', $booking->service_id)->value('name');
            $return_data['booking_time'] = Carbon::parse($booking->booking_date)->format('Y-m-d H:i:s');

            $results[] = $return_data;
        }
        return $results;
    }
}
