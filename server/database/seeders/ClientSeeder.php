<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 50 dummy clients
        Client::factory()->count(50)->create();
        
        // Optionally create one specific test client
        Client::updateOrCreate(
            ['email' => 'testclient@example.com'],
            [
                'fullname' => 'Test Client',
                'username' => 'testclient',
                'password' => 'password', // Hash cast in model handles this
                'role' => 'client',
            ]
        );
    }
}
