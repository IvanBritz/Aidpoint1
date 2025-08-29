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
            $table->string('username')->unique()->nullable();
            $table->foreignId('position_id')->nullable()->constrained('positions')->onDelete('set null');
            $table->json('privileges')->nullable(); // Legacy privilege storage
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('organization_id')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('must_change_password')->default(false);
            $table->timestamp('password_changed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['organization_id']);
            $table->dropColumn([
                'username',
                'position_id',
                'privileges',
                'created_by',
                'organization_id',
                'must_change_password',
                'password_changed_at'
            ]);
        });
    }
};