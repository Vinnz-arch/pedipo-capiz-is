<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('parent_opportunities', function (Blueprint $table) {
            $table->string('data_year', 20)->nullable()->after('description');
            $table->json('spreadsheet_data')->nullable()->after('data_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parent_opportunities', function (Blueprint $table) {
            $table->dropColumn(['data_year', 'spreadsheet_data']);
        });
    }
};
