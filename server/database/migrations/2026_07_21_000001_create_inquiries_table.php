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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities')->onDelete('cascade');
            $table->string('investor_name');
            $table->string('email');
            $table->string('company')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->string('subject')->nullable();
            $table->string('purpose')->nullable();
            $table->string('letter_of_intent')->nullable();
            $table->string('supporting_documents')->nullable();
            $table->text('message');
            $table->string('status')->default('Submitted');
            $table->text('admin_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
