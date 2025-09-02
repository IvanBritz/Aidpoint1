<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('subscriptions');
        
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id('subscription_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('plan_id');
            $table->date('subscription_start_date');
            $table->date('subscription_end_date');
            $table->enum('subscription_status', ['Active', 'Inactive', 'Suspended', 'Cancelled'])->default('Active');
            $table->enum('payment_status', ['Paid', 'Pending', 'Overdue', 'Failed'])->default('Pending');
            $table->boolean('auto_renewal')->default(true);
            $table->timestamp('created_date')->useCurrent();
            $table->timestamp('last_modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->date('cancellation_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};