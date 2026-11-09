<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\Inquiry;
use App\Models\MsmeAssistanceRequest;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // Backfill for existing inquiries
        $inquiries = Inquiry::with('opportunity')->latest()->take(5)->get();
        foreach ($inquiries as $inquiry) {
            $projectName = $inquiry->opportunity ? $inquiry->opportunity->project_name : 'General Opportunity';
            AppNotification::firstOrCreate(
                [
                    'role' => 'admin',
                    'type' => 'inquiry',
                    'action_url' => '/app/manageInquires?type=inquiry&id=' . $inquiry->id,
                ],
                [
                    'title' => 'New Investment Inquiry',
                    'message' => "{$inquiry->investor_name}" . (!empty($inquiry->company) ? " ({$inquiry->company})" : "") . " submitted an inquiry for {$projectName}.",
                    'data' => [
                        'inquiry_id' => $inquiry->id,
                        'investor_name' => $inquiry->investor_name,
                        'company' => $inquiry->company,
                        'email' => $inquiry->email,
                        'project_name' => $projectName,
                    ],
                    'created_at' => $inquiry->created_at ?? now(),
                ]
            );
        }

        // Backfill for existing MSME assistance requests
        $requests = MsmeAssistanceRequest::latest()->take(5)->get();
        foreach ($requests as $request) {
            AppNotification::firstOrCreate(
                [
                    'role' => 'admin',
                    'type' => 'msme_request',
                    'action_url' => '/app/manageInquires?tab=msme&id=' . $request->id,
                ],
                [
                    'title' => 'New MSME Assistance Request',
                    'message' => "{$request->company_name} requested {$request->classification}.",
                    'data' => [
                        'request_id' => $request->id,
                        'company_name' => $request->company_name,
                        'contact_person' => $request->contact_person,
                        'classification' => $request->classification,
                        'email' => $request->email,
                    ],
                    'created_at' => $request->created_at ?? now(),
                ]
            );
        }

        // Phase 2: Seed Investor & Client Notifications
        $clientUser = \App\Models\User::where('email', 'client@pedipo.com')->first() ?: \App\Models\User::first();
        if ($clientUser) {
            AppNotification::firstOrCreate(
                [
                    'role' => 'client',
                    'user_id' => $clientUser->id,
                    'type' => 'inquiry_status',
                    'title' => 'Inquiry Workflow Advanced',
                ],
                [
                    'message' => "Your investment inquiry for Pontevedra Sustainable Aquaculture has been evaluated and advanced to 'Step 2: LEDIP Review'.",
                    'action_url' => '/portal/investorPortal',
                    'data' => [
                        'status' => 'Under Review',
                        'project_name' => 'Pontevedra Sustainable Aquaculture',
                    ],
                    'created_at' => now()->subHours(3),
                ]
            );

            $firstRequest = MsmeAssistanceRequest::where('user_id', $clientUser->id)->first() ?: MsmeAssistanceRequest::first();
            $requestId = $firstRequest ? $firstRequest->id : 1;
            AppNotification::firstOrCreate(
                [
                    'role' => 'client',
                    'user_id' => $clientUser->id,
                    'type' => 'msme_status',
                    'title' => 'Assistance Request Progress',
                ],
                [
                    'message' => "Your business processing request for Capiz Agritech Co. has advanced to 'Step 2: LEDIP Review'.",
                    'action_url' => '/portal/msmeAssistance?id=' . $requestId,
                    'data' => [
                        'request_id' => $requestId,
                        'status' => 'Under Review',
                        'company_name' => 'Capiz Agritech Co.',
                    ],
                    'created_at' => now()->subHours(1),
                ]
            );
        }

        // Broadcast notification for all investors
        AppNotification::firstOrCreate(
            [
                'role' => 'client',
                'user_id' => null,
                'type' => 'report',
                'title' => 'New Investment Report Available',
            ],
            [
                'message' => "The 2026 Annual Aquaculture & Production Report has been officially uploaded to the Investor Portal.",
                'action_url' => '/portal/investorPortal',
                'data' => [
                    'category' => 'Agri-Industrial',
                ],
                'created_at' => now()->subMinutes(30),
            ]
        );
    }
}
