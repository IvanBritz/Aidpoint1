<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Privilege;

class PrivilegeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $privileges = [
            // User Management
            [
                'name' => 'manage_users',
                'description' => 'Create, read, update, and delete user accounts',
                'category' => 'user_management',
            ],
            [
                'name' => 'view_users',
                'description' => 'View user accounts and profiles',
                'category' => 'user_management',
            ],
            [
                'name' => 'create_employees',
                'description' => 'Create new employee accounts',
                'category' => 'user_management',
            ],
            
            // Application Management
            [
                'name' => 'manage_applications',
                'description' => 'Full access to financial aid applications',
                'category' => 'application_management',
            ],
            [
                'name' => 'create_applications',
                'description' => 'Create new financial aid applications',
                'category' => 'application_management',
            ],
            [
                'name' => 'view_applications',
                'description' => 'View financial aid applications',
                'category' => 'application_management',
            ],
            [
                'name' => 'approve_applications',
                'description' => 'Approve or reject financial aid applications',
                'category' => 'application_management',
            ],
            [
                'name' => 'edit_applications',
                'description' => 'Edit financial aid applications',
                'category' => 'application_management',
            ],
            
            // Financial Management
            [
                'name' => 'manage_disbursements',
                'description' => 'Manage cash disbursements and payments',
                'category' => 'financial_management',
            ],
            [
                'name' => 'cash_disbursement',
                'description' => 'Process cash disbursements',
                'category' => 'financial_management',
            ],
            [
                'name' => 'view_financial_reports',
                'description' => 'View financial reports and analytics',
                'category' => 'financial_management',
            ],
            
            // Documentation & Compliance
            [
                'name' => 'manage_receipts',
                'description' => 'Review and manage receipts',
                'category' => 'documentation',
            ],
            [
                'name' => 'receipts_review',
                'description' => 'Review submitted receipts',
                'category' => 'documentation',
            ],
            [
                'name' => 'liquidation',
                'description' => 'Handle liquidation processes',
                'category' => 'documentation',
            ],
            
            // System Administration
            [
                'name' => 'view_audit_logs',
                'description' => 'View system audit logs',
                'category' => 'system_administration',
            ],
            [
                'name' => 'auditlog',
                'description' => 'Access audit log functionality',
                'category' => 'system_administration',
            ],
            [
                'name' => 'manage_settings',
                'description' => 'Manage system settings and configuration',
                'category' => 'system_administration',
            ],
            
            // Core employee privileges
            [
                'name' => 'aid_request',
                'description' => 'Can view and process aid requests from beneficiaries',
                'category' => 'operations',
            ],
            [
                'name' => 'disbursement',
                'description' => 'Can handle cash disbursements and financial transactions',
                'category' => 'finance',
            ],
        ];
        
        foreach ($privileges as $privilege) {
            Privilege::firstOrCreate(
                ['name' => $privilege['name']],
                [
                    'description' => $privilege['description'],
                    'category' => $privilege['category'],
                ]
            );
        }
        
        $this->command->info('Default privileges seeded successfully!');
    }
}
