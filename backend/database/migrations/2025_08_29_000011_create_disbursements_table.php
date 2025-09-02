<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disbursements', function (Blueprint $table) {
            $table->id('disbursement_id');
            $table->unsignedBigInteger('aid_id');
            $table->decimal('disbursement_amount', 10, 2);
            $table->date('disbursement_date');
            $table->enum('disbursement_method', ['Cash', 'Bank Transfer', 'Check']);
            $table->unsignedBigInteger('processed_by');
            $table->enum('status', ['Pending', 'Completed', 'Failed'])->default('Pending');
            $table->string('transaction_reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disbursements');
    }
};