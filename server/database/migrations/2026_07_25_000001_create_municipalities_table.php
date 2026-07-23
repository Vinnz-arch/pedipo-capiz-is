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
        Schema::create('municipalities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('class'); // e.g. "1st Class", "2nd Class", "Component City"
            $table->integer('population')->default(0);
            $table->decimal('land_area', 8, 2)->default(0.00); // in sq km
            $table->integer('barangay_count')->default(0);
            $table->decimal('gdp', 12, 2)->nullable(); // GDP in million PHP
            $table->text('key_industries')->nullable(); // comma-separated or json string
            $table->text('description')->nullable();
            $table->string('seal_path')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('website_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('municipalities');
    }
};
