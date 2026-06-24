<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 50 dummy users
        User::factory()->count(50)->create();

        // Create 1 test user
        User::updateOrCreate(
            ['email' => 'client@pedipo.com'],
            [
                'fullname' => 'Test Client',
                'username' => 'testclient',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
