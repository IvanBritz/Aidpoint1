<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            [
                'name' => 'Caseworker',
                'description' => 'Handles aid requests and beneficiary management. Responsible for assessing and processing aid requests from beneficiaries.',
            ],
            [
                'name' => 'Finance Officer',
                'description' => 'Manages financial operations, disbursements, and liquidations. Handles financial transactions and reporting.',
            ],
            [
                'name' => 'Program Coordinator',
                'description' => 'Coordinates program activities and manages overall operations. Oversees program implementation and monitoring.',
            ],
            [
                'name' => 'Administrative Assistant',
                'description' => 'Provides administrative support and handles general office tasks. Assists with documentation and communication.',
            ],
        ];

        foreach ($positions as $position) {
            Position::firstOrCreate(
                ['name' => $position['name']], 
                $position
            );
        }
    }
}