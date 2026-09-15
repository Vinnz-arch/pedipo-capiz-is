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
        // 1. Drop foreign key constraints on dependent tables
        Schema::table('opportunities', function (Blueprint $table) {
            $table->dropForeign(['municipality_id']);
        });

        Schema::table('msmes', function (Blueprint $table) {
            $table->dropForeign(['municipality_id']);
        });

        Schema::table('indicator_values', function (Blueprint $table) {
            $table->dropForeign(['municipality_id']);
        });

        // 2. Drop the municipalities table
        Schema::dropIfExists('municipalities');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate municipalities table
        Schema::create('municipalities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('class');
            $table->integer('population')->default(0);
            $table->decimal('land_area', 8, 2)->default(0.00);
            $table->integer('barangay_count')->default(0);
            $table->decimal('gdp', 12, 2)->nullable();
            $table->text('key_industries')->nullable();
            $table->text('description')->nullable();
            $table->string('seal_path')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website_url')->nullable();
            $table->timestamps();
        });

        // Restore foreign key constraints
        Schema::table('opportunities', function (Blueprint $table) {
            $table->foreign('municipality_id')->references('id')->on('municipalities')->onDelete('cascade');
        });

        Schema::table('msmes', function (Blueprint $table) {
            $table->foreign('municipality_id')->references('id')->on('municipalities')->onDelete('set null');
        });

        Schema::table('indicator_values', function (Blueprint $table) {
            $table->foreign('municipality_id')->references('id')->on('municipalities')->onDelete('cascade');
        });
    }
};
