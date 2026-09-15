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
        Schema::table('msmes', function (Blueprint $table) {
            $table->string('product_image_1')->nullable()->after('cover_path');
            $table->string('product_image_2')->nullable()->after('product_image_1');
            $table->string('product_image_3')->nullable()->after('product_image_2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('msmes', function (Blueprint $table) {
            $table->dropColumn(['product_image_1', 'product_image_2', 'product_image_3']);
        });
    }
};
