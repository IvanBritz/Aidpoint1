<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews_recommendations', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('beneficiary_id')->nullable();
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->string('related_table');
            $table->unsignedBigInteger('related_id');
            $table->text('description');
            $table->integer('rating')->check('rating >= 1 AND rating <= 5');
            $table->date('review_date');
            $table->enum('status', ['Active', 'Archived'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews_recommendations');
    }
};