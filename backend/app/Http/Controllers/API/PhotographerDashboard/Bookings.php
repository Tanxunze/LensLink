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
    //
    public function index(Request $request)
    {
        $photographer_id=$request->user()->photographerProfile->id;
        $bookings=$this->getPhotographerBookings($photographer_id);
        return response()->json([
            'message'=>'success',
            'bookings'=> $bookings
        ]);
    }

    private function getPhotographerBookings(int $photographer_id)
    {
        $bookings=Booking::where("photographer_id",$photographer_id)->get();
        $results=[];
        foreach ($bookings as $booking) {
            $return_data=$booking->toArray();
            $return_data['customer_name']=User::where('id',$booking->customer_id)->value('name');
            $return_data['service_name']=Service::where('id',$booking->service_id)->value('name');
            $return_data['booking_time']=$booking->booking_date;

            $results[]=$return_data;
        }
        return $results;
    }
}
