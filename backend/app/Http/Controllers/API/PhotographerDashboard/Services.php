<?php

namespace App\Http\Controllers\API\PhotographerDashboard;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Dotenv\Validator;
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
        return Service::where('photographer_id', $photographer_id)->get();
    }

    public function edit($id)
    {
        $service = Service::where('id', $id)
//            ->where('photographer_id',request()->user()->photographerProfile->id) // Needed?
            ->first();

        if (!$service) {
            return response()->json('Service not found', 404);
        }

        if ($service->features) {
            $service->features = json_decode($service->features);
        } else {
            $service->features = [];
        }

        return response()->json($service);
    }

    public function update(Request $request, $id)
    {
        $service = Service::where('id', $id)
            ->first();

        if(!$service) {
            return response()->json('Service not found', 404);
        }

        $validated=$request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'duration' => 'nullable|integer|min:0',
            'is_featured' => 'nullable|boolean',
            'features' => 'nullable|array',
        ]);

        if(isset($validated['features'])) {
            $validated['features']= json_encode($validated['features']);
        }

        $service->update($validated);

        return response()->json([
            'message' => 'Service updated successfully',
            'service' => $service
        ]);
    }

    public function updateFeatureStatus(Request $request, $id)
    {
        $service = Service::where('id', $id)
            ->first();

        if (!$service) {
            return response()->json(['message' => 'Service does not exists'], 404);
        }

        $validated = $request->validate([
            'is_featured' => 'required|boolean',
        ]);

        $service->is_featured = $validated['is_featured'];
        $service->save();

        return response()->json([
            'message' => $validated['is_featured'] ? 'Featured' : 'Unfeatured',
            'service' => $service
        ]);
    }

    public function destroy($id)
    {
        $service = Service::where('id', $id)
            ->first();

        if (!$service) {
            return response()->json(['message' => 'Service does not exist, or you do not have the authority to delete it.'], 404);
        }

        // 执行删除
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully',
            'id' => $id
        ]);
    }
}
