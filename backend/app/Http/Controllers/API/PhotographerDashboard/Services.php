<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class Services extends Controller
{
    public function index(Request $request)
    {
        $photographer_id = $request->user()->photographerProfile->id;
        return response()->json($this->getServices($photographer_id));
    }

    private function getServices(int $photographer_id)
    {
        return Service::where('photographer_id',$photographer_id)->get();
    }
}
