<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('opportunities')
            ->where('image_path', '/images/seafood_hub.png')
            ->where('project_name', '!=', 'Roxas City Aquaculture Association')
            ->update(['image_path' => null]);

        DB::table('parent_opportunities')
            ->where('image_path', '/images/seafood_hub.png')
            ->where('name', '!=', 'Aquaculture')
            ->update(['image_path' => null]);

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data cleanup only; no automatic restoration of legacy default path.
    }
};

