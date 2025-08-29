<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed plans first
        $this->call(PlansSeeder::class);
        
        // Seed privileges
        $this->call(PrivilegeSeeder::class);
        
        // Seed positions
        $this->call(PositionsTableSeeder::class);
        
        // Create a test project director
        User::firstOrCreate(
            ['email' => 'director@example.com'],
            [
                'name' => 'Test Director',
                'email' => 'director@example.com',
                'username' => 'test.director',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'project_director',
                'status' => 'active',
            ]
        );
        
        // Create a test beneficiary user
        User::firstOrCreate(
            ['email' => 'beneficiary@example.com'],
            [
                'name' => 'Test Beneficiary',
                'email' => 'beneficiary@example.com',
                'username' => 'test.beneficiary',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'beneficiary',
                'status' => 'active',
            ]
        );
    }
}
