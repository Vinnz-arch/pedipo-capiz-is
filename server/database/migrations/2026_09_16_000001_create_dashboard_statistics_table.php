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
        Schema::create('dashboard_statistics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_key')->unique();
            $table->decimal('value', 15, 2)->nullable();
            $table->string('display_value');
            $table->string('unit')->nullable();
            $table->integer('reference_year')->nullable();
            $table->decimal('growth_rate', 5, 2)->nullable();
            $table->string('source_name');
            $table->string('source_url', 1000);
            $table->string('source_title');
            $table->timestamp('retrieved_at')->nullable();
            $table->string('status')->default('verified');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_statistics');
    }
};
