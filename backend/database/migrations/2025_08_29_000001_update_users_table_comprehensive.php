<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', ['Admin', 'Employee', 'Regular'])->after('password');
            $table->enum('status', ['Active', 'Inactive'])->default('Active')->after('user_type');
            $table->dropColumn('email_verified_at');
            $table->dropColumn('remember_token');
            $table->renameColumn('created_at', 'created_date');
            $table->renameColumn('updated_at', 'last_modified_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_type', 'status']);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->renameColumn('created_date', 'created_at');
            $table->renameColumn('last_modified_date', 'updated_at');
        });
    }
};