<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_history', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('subscription_id');
            $table->decimal('payment_amount', 10, 2);
            $table->date('payment_date');
            $table->enum('payment_method', ['Credit Card', 'Bank Transfer', 'Cash']);
            $table->enum('payment_status', ['Success', 'Failed', 'Pending'])->default('Pending');
            $table->string('transaction_id')->nullable();
            $table->string('invoice_number')->nullable();
            $table->timestamp('created_date')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_history');
    }
};