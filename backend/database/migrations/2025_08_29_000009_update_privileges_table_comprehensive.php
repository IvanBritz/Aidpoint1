<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('privileges');
        
        Schema::create('privileges', function (Blueprint $table) {
            $table->id('privilege_id');
            $table->string('privilege_name');
            $table->boolean('aid_request_access')->default(false);
            $table->boolean('disbursement_access')->default(false);
            $table->boolean('liquidation_access')->default(false);
            $table->boolean('audit_log_access')->default(false);
            $table->boolean('monitoring_access')->default(false);
            $table->boolean('receipts_access')->default(false);
            $table->timestamp('created_date')->useCurrent();
            $table->timestamp('last_modified_date')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('privileges');
    }
};