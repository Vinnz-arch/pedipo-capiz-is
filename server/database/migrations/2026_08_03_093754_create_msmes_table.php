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
        Schema::create('msmes', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->string('owner_name');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('enterprise_type'); // e.g. "Micro", "Small", "Medium"
            $table->foreignId('municipality_id')->nullable()->constrained('municipalities')->onDelete('set null');
            $table->string('barangay');
            $table->string('complete_address');
            $table->string('contact_number');
            $table->string('email_address')->nullable();
            $table->text('business_description');
            $table->text('products_services')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('status')->default('Pending Approval'); // 'Active', 'Inactive', 'Pending Approval'
            $table->date('date_registered');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('msmes');
    }
};
