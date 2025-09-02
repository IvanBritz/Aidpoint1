<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('liquidations', function (Blueprint $table) {
            $table->id('liquidation_id');
            $table->unsignedBigInteger('aid_id');
            $table->unsignedBigInteger('disbursement_id');
            $table->unsignedBigInteger('receipt_id');
            $table->decimal('receipt_amount', 10, 2);
            $table->date('receipt_date');
            $table->enum('liquidation_status', ['Pending', 'Complete', 'Incomplete'])->default('Pending');
            $table->date('submitted_date');
            $table->unsignedBigInteger('processed_by');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidations');
    }
};