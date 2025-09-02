<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('plans');
        
        Schema::create('plans', function (Blueprint $table) {
            $table->id('plan_id');
            $table->string('plan_name');
            $table->text('plan_description');
            $table->decimal('plan_price', 10, 2);
            $table->enum('billing_cycle', ['Monthly', 'Quarterly', 'Yearly']);
            $table->integer('max_beneficiaries');
            $table->json('plan_features');
            $table->enum('plan_status', ['Active', 'Inactive'])->default('Active');
            $table->timestamp('created_date')->useCurrent();
            $table->timestamp('last_modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};