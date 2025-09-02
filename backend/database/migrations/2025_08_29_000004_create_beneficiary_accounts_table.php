<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiary_accounts', function (Blueprint $table) {
            $table->id('baid');
            $table->unsignedBigInteger('beneficiary_id');
            $table->string('beneficiary_username')->unique();
            $table->string('beneficiary_password');
            $table->timestamp('created_date')->useCurrent();
            $table->timestamp('last_login_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiary_accounts');
    }
};