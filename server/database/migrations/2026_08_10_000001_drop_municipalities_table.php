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
        Schema::disableForeignKeyConstraints();

        // 1. Drop foreign key constraints on dependent tables safely
        if (Schema::hasTable('opportunities')) {
            try {
                Schema::table('opportunities', function (Blueprint $table) {
                    $table->dropForeign(['municipality_id']);
                });
            } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('msmes')) {
            try {
                Schema::table('msmes', function (Blueprint $table) {
                    $table->dropForeign(['municipality_id']);
                });
            } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('indicator_values')) {
            try {
                Schema::table('indicator_values', function (Blueprint $table) {
                    $table->dropForeign(['municipality_id']);
                });
            } catch (\Throwable $e) {}
        }

        // 2. Drop the municipalities table
        Schema::dropIfExists('municipalities');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Recreate municipalities table if it does not exist
        if (!Schema::hasTable('municipalities')) {
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
        }

        // Restore foreign key constraints safely
        if (Schema::hasTable('opportunities')) {
            try {
                Schema::table('opportunities', function (Blueprint $table) {
                    $table->foreign('municipality_id')->references('id')->on('municipalities')->onDelete('cascade');
                });
            } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('msmes')) {
            try {
                Schema::table('msmes', function (Blueprint $table) {
                    $table->foreign('municipality_id')->references('id')->on('municipalities')->onDelete('set null');
                });
            } catch (\Throwable $e) {}
        }

        if (Schema::hasTable('indicator_values')) {
            try {
                Schema::table('indicator_values', function (Blueprint $table) {
                    $table->foreign('municipality_id')->references('id')->on('municipalities')->onDelete('cascade');
                });
            } catch (\Throwable $e) {}
        }

        Schema::enableForeignKeyConstraints();
    }
};
