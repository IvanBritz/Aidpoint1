<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_features', function (Blueprint $table) {
            $table->id('concern_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('beneficiary_id')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->enum('concern_type', ['Complaint', 'Suggestion', 'Issue']);
            $table->text('description');
            $table->enum('priority', ['High', 'Medium', 'Low'])->default('Medium');
            $table->enum('status', ['Open', 'In Progress', 'Resolved', 'Closed'])->default('Open');
            $table->timestamp('created_date')->useCurrent();
            $table->date('resolved_date')->nullable();
            $table->string('resolved_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_features');
    }
};