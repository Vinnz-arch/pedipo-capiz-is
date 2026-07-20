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
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->string('project_name');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->decimal('roi_estimate', 8, 2)->nullable();
            $table->decimal('land_area', 8, 2)->nullable();
            $table->text('key_incentives')->nullable();
            $table->text('description')->nullable();
            $table->text('incentive_package')->nullable();
            $table->string('image_path')->nullable();
            $table->string('status')->default('Draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
