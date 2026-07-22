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
        Schema::create('landing_page_settings', function (Blueprint $table) {
            $table->id();
            
            // Hero
            $table->string('hero_badge');
            $table->string('hero_title');
            $table->string('hero_subtitle');
            $table->text('hero_description');
            $table->string('hero_image_path')->nullable();
            
            // Vision & Mission
            $table->text('vision_text');
            $table->text('mission_point_1');
            $table->text('mission_point_2');
            $table->text('mission_point_3');
            
            // MSME
            $table->string('msme_title');
            $table->text('msme_description');
            $table->string('msme_image_path')->nullable();
            
            // Mandate & Pledge
            $table->text('mandate_text');
            $table->string('mandate_image_path')->nullable();
            $table->text('service_pledge_1');
            $table->text('service_pledge_2');
            $table->text('service_pledge_3');
            $table->text('service_pledge_4');
            
            // Contact
            $table->string('contact_address');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->string('contact_facebook')->nullable();
            $table->string('contact_twitter')->nullable();
            $table->string('contact_linkedin')->nullable();
            
            // Divisions
            $table->string('division_1_title');
            $table->string('division_1_subtitle');
            $table->text('division_1_bullets');
            
            $table->string('division_2_title');
            $table->string('division_2_subtitle');
            $table->text('division_2_bullets');
            
            $table->string('division_3_title');
            $table->string('division_3_subtitle');
            $table->text('division_3_bullets');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_page_settings');
    }
};
