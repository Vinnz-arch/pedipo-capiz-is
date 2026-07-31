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
        Schema::create('indicator_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipality_id')->constrained('municipalities')->onDelete('cascade');
            $table->foreignId('indicator_id')->constrained('indicators')->onDelete('cascade');
            $table->foreignId('source_id')->constrained('indicator_sources')->onDelete('cascade');
            $table->decimal('value', 15, 4);
            $table->integer('year');
            $table->integer('quarter')->nullable(); // 1, 2, 3, 4 or null if annual
            $table->string('verification_status')->default('verified'); // verified, pending, unverified
            $table->timestamp('retrieved_at')->useCurrent();
            $table->timestamp('last_updated')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();

            // Ensure unique value per municipality, indicator, year, and quarter
            $table->unique(['municipality_id', 'indicator_id', 'year', 'quarter'], 'uniq_muni_ind_yr_qtr');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicator_values');
    }
};
