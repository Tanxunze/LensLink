<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;

class PhotographerProfileController extends Controller
{
    //
    public function index(Request $request)
    {
        $photographer_id=$request->input('photographer_id');
        $works=Booking::where('photographer_id',$photographer_id)->get();
        $count=0;
        if(!$works)
        {
            foreach($works as $work)
            {
                if($work->photographer_id==$photographer_id)
                {
                    $count++;
                }
            }
            $data=[
                'message'=>'success',
                'work_count'=>$count,
                'works'=>$works
            ];
            return $data;
        }
    }
}
