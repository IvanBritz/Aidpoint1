<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id('receipt_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('beneficiary_id');
            $table->string('receipt_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->string('vendor');
            $table->string('category');
            $table->text('description');
            $table->string('image_path')->nullable();
            $table->enum('status', ['Verified', 'Pending', 'Rejected'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};