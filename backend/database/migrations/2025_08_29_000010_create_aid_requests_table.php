<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aid_requests', function (Blueprint $table) {
            $table->id('aid_id');
            $table->unsignedBigInteger('beneficiary_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('user_id');
            $table->string('request_type');
            $table->decimal('request_amount', 10, 2);
            $table->date('request_date');
            $table->enum('request_status', ['Pending', 'Approved', 'Rejected', 'Processing'])->default('Pending');
            $table->date('approval_date')->nullable();
            $table->string('approved_by')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->enum('priority', ['High', 'Medium', 'Low'])->default('Medium');
            $table->text('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aid_requests');
    }
};