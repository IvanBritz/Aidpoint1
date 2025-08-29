<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic Plan',
                'description' => 'Perfect for small organizations managing financial aid programs.',
                'price' => 29.99,
                'duration_days' => 30,
                'max_beneficiaries' => 50,
                'max_employees' => 5,
                'features' => json_encode([
                    'Beneficiary Management',
                    'Basic Reporting',
                    'Email Support',
                    'Document Upload',
                    'Basic Analytics'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Professional Plan',
                'description' => 'Comprehensive features for medium-sized organizations.',
                'price' => 59.99,
                'duration_days' => 30,
                'max_beneficiaries' => 200,
                'max_employees' => 20,
                'features' => json_encode([
                    'Beneficiary Management',
                    'Advanced Reporting',
                    'Priority Support',
                    'Document Management',
                    'Advanced Analytics',
                    'Custom Fields',
                    'Export Data'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise Plan',
                'description' => 'Full-featured solution for large organizations.',
                'price' => 99.99,
                'duration_days' => 30,
                'max_beneficiaries' => 0, // Unlimited
                'max_employees' => 0, // Unlimited
                'features' => json_encode([
                    'Unlimited Beneficiaries',
                    'Unlimited Employees',
                    'Advanced Reporting',
                    'Priority Support',
                    'Document Management',
                    'Advanced Analytics',
                    'Custom Fields',
                    'API Access',
                    'White Labeling',
                    'Custom Integrations'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];
        
        DB::table('plans')->insert($plans);
    }
}
