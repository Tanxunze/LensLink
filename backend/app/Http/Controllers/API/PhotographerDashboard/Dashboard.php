<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;

class Dashboard extends Controller
{
    public function index(Request $request)
    {
        $photographer_id = $request->input('photographer_id');
        $works_return=$this->getWorkAmount($photographer_id);
        $data=[
            'message'=>'success',
            'work_amount'=>$works_return['work_amount'],
            'works'=>$works_return['works']
        ];
        return response()->json($data,200);
    }
    //
    private function getWorkAmount(int $photographer_id)
    {
        $works=Booking::where('photographer_id',$photographer_id)->get();
        $count=0;
        $pending_work=0;
        $confirmed_work=0;
        $completed_work=0;
        foreach($works as $work)
        {
            if($work->photographer_id==$photographer_id)
            {
                switch($work->status)
                {
                    case 'confirmed': $confirmed_work++; break;
                    case 'completed': $completed_work++; break;
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
                'completed'=>$completed_work
            ]
        ];
    }
}
