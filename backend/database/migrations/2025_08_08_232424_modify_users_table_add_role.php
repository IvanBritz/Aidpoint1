<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['project_director', 'employee', 'beneficiary'])->default('project_director');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('status')->default('active');
            $table->unsignedBigInteger('created_by')->nullable(); // Who created this user
            $table->unsignedBigInteger('organization_id')->nullable(); // Link to project director
            
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('organization_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['organization_id']);
            $table->dropColumn(['role', 'phone', 'address', 'status', 'created_by', 'organization_id']);
        });
    }
};
