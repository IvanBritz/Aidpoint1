<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Position;
use Illuminate\Support\Facades\DB;

class PositionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            [
                'name' => 'Caseworker',
                'description' => 'Responsible for assessing and processing aid requests from beneficiaries'
            ],
            [
                'name' => 'Finance',
                'description' => 'Handles financial transactions, disbursements, and financial reporting'
            ],
            [
                'name' => 'Field Officer',
                'description' => 'Conducts field visits and assessments for aid verification'
            ],
            [
                'name' => 'Program Coordinator',
                'description' => 'Coordinates program activities and manages team operations'
            ],
            [
                'name' => 'Data Analyst',
                'description' => 'Analyzes program data and generates reports for decision making'
            ],
            [
                'name' => 'Administrative Assistant',
                'description' => 'Provides administrative support and maintains documentation'
            ]
        ];

        foreach ($positions as $position) {
            Position::updateOrCreate(
                ['name' => $position['name']],
                $position
            );
        }
    }
}
