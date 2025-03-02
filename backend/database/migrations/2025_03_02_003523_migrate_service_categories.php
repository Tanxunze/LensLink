<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Service;
use App\Models\PhotographerProfile;
use App\Models\Category;

class MigrateServiceCategories extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $services = Service::all();

        foreach ($services as $service) {
            $photographer = PhotographerProfile::find($service->photographer_id);

            if ($photographer && $photographer->categories->isNotEmpty()) {
                $categoryId = $photographer->categories->first()->id;

                DB::table('service_categories')->insert([
                    'service_id' => $service->id,
                    'category_id' => $categoryId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('service_categories')->truncate();
    }
}
