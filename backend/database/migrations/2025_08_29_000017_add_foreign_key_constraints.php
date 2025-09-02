<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add foreign keys to employees table
        Schema::table('employees', function (Blueprint $table) {
            $table->foreign('user_id', 'fk_employees_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('privileges_id', 'fk_employees_privileges_id')->references('privilege_id')->on('privileges')->onDelete('set null');
        });

        // Add foreign keys to beneficiaries table
        Schema::table('beneficiaries', function (Blueprint $table) {
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('privileges_id')->references('privilege_id')->on('privileges')->onDelete('set null');
        });

        // Add foreign keys to beneficiary_accounts table
        Schema::table('beneficiary_accounts', function (Blueprint $table) {
            $table->foreign('beneficiary_id')->references('beneficiary_id')->on('beneficiaries')->onDelete('cascade');
        });

        // Add foreign keys to subscriptions table
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('plan_id')->on('plans')->onDelete('cascade');
        });

        // Add foreign keys to payment_history table
        Schema::table('payment_history', function (Blueprint $table) {
            $table->foreign('subscription_id')->references('subscription_id')->on('subscriptions')->onDelete('cascade');
        });

        // Add foreign keys to plan_features table
        Schema::table('plan_features', function (Blueprint $table) {
            $table->foreign('plan_id')->references('plan_id')->on('plans')->onDelete('cascade');
        });

        // Add foreign keys to aid_requests table
        Schema::table('aid_requests', function (Blueprint $table) {
            $table->foreign('beneficiary_id')->references('beneficiary_id')->on('beneficiaries')->onDelete('cascade');
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add foreign keys to disbursements table
        Schema::table('disbursements', function (Blueprint $table) {
            $table->foreign('aid_id')->references('aid_id')->on('aid_requests')->onDelete('cascade');
            $table->foreign('processed_by')->references('employee_id')->on('employees')->onDelete('cascade');
        });

        // Add foreign keys to receipts table
        Schema::table('receipts', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('beneficiary_id')->references('beneficiary_id')->on('beneficiaries')->onDelete('cascade');
        });

        // Add foreign keys to liquidations table
        Schema::table('liquidations', function (Blueprint $table) {
            $table->foreign('aid_id')->references('aid_id')->on('aid_requests')->onDelete('cascade');
            $table->foreign('disbursement_id')->references('disbursement_id')->on('disbursements')->onDelete('cascade');
            $table->foreign('receipt_id')->references('receipt_id')->on('receipts')->onDelete('cascade');
            $table->foreign('processed_by')->references('employee_id')->on('employees')->onDelete('cascade');
        });

        // Add foreign keys to audit_logs table
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreign('liquidation_id')->references('liquidation_id')->on('liquidations')->onDelete('set null');
            $table->foreign('disbursement_id')->references('disbursement_id')->on('disbursements')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Add foreign keys to concern_features table
        Schema::table('concern_features', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('beneficiary_id')->references('beneficiary_id')->on('beneficiaries')->onDelete('set null');
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('set null');
        });

        // Add foreign keys to reviews_recommendations table
        Schema::table('reviews_recommendations', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('beneficiary_id')->references('beneficiary_id')->on('beneficiaries')->onDelete('set null');
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Drop foreign keys in reverse order
        Schema::table('reviews_recommendations', function (Blueprint $table) {
            $table->dropForeign(['user_id', 'beneficiary_id', 'employee_id']);
        });

        Schema::table('concern_features', function (Blueprint $table) {
            $table->dropForeign(['user_id', 'beneficiary_id', 'employee_id']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropForeign(['liquidation_id', 'disbursement_id', 'user_id']);
        });

        Schema::table('liquidations', function (Blueprint $table) {
            $table->dropForeign(['aid_id', 'disbursement_id', 'receipt_id', 'processed_by']);
        });

        Schema::table('receipts', function (Blueprint $table) {
            $table->dropForeign(['user_id', 'employee_id', 'beneficiary_id']);
        });

        Schema::table('disbursements', function (Blueprint $table) {
            $table->dropForeign(['aid_id', 'processed_by']);
        });

        Schema::table('aid_requests', function (Blueprint $table) {
            $table->dropForeign(['beneficiary_id', 'employee_id', 'user_id']);
        });

        Schema::table('plan_features', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
        });

        Schema::table('payment_history', function (Blueprint $table) {
            $table->dropForeign(['subscription_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['user_id', 'plan_id']);
        });

        Schema::table('beneficiary_accounts', function (Blueprint $table) {
            $table->dropForeign(['beneficiary_id']);
        });

        Schema::table('beneficiaries', function (Blueprint $table) {
            $table->dropForeign(['employee_id', 'user_id', 'privileges_id']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['user_id', 'privileges_id']);
        });
    }
};