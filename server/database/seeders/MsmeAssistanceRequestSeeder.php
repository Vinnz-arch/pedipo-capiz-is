<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MsmeAssistanceRequest;
use Illuminate\Database\Seeder;

class MsmeAssistanceRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'client@pedipo.com')->first();

        if ($user) {
            MsmeAssistanceRequest::create([
                'user_id' => $user->id,
                'company_name' => 'Capiz Agritech Co.',
                'contact_person' => 'Test Client',
                'email' => 'client@pedipo.com',
                'phone' => '0917-123-4567',
                'classification' => 'Simple Transaction',
                'description' => 'Requesting BDD assistance for product marketing development and branding packaging design for local processed ginger teas.',
                'request_letter_path' => '/storage/msme/letters/mock_letter_1.pdf',
                'other_docs_path' => null,
                'status' => 'Submitted',
                'admin_notes' => null,
            ]);

            MsmeAssistanceRequest::create([
                'user_id' => $user->id,
                'company_name' => 'Roxas Seafood Traders',
                'contact_person' => 'Test Client',
                'email' => 'client@pedipo.com',
                'phone' => '0917-123-4567',
                'classification' => 'Complex Transaction',
                'description' => 'Seeking promotion and facilitation services to export canned dried seafood products to international distributors.',
                'request_letter_path' => '/storage/msme/letters/mock_letter_2.pdf',
                'other_docs_path' => '/storage/msme/docs/mock_docs_2.zip',
                'status' => 'Processing',
                'admin_notes' => 'Conferred request with LEDIP Officer. Endorsed to BDD, now drafting compliance recommendations.',
            ]);
        }
    }
}
