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
            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false);
            }
            if (!Schema::hasColumn('users', 'password_changed_at')) {
                $table->timestamp('password_changed_at')->nullable();
            }
        });
        
        // Create user_privileges table if it doesn't exist
        if (!Schema::hasTable('user_privileges')) {
            Schema::create('user_privileges', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('privilege_id')->constrained('privileges')->onDelete('cascade');
                $table->foreignId('granted_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('granted_at')->nullable();
                $table->timestamps();
                
                $table->unique(['user_id', 'privilege_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'must_change_password')) {
                $table->dropColumn('must_change_password');
            }
            if (Schema::hasColumn('users', 'password_changed_at')) {
                $table->dropColumn('password_changed_at');
            }
        });
        
        if (Schema::hasTable('user_privileges')) {
            Schema::dropIfExists('user_privileges');
        }
    }
};