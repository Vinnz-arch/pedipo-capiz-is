<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\Opportunity;
use Illuminate\Database\Seeder;

class InquirySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $seafood = Opportunity::where('project_name', 'Seafood Processing Hub')->first();
        $itPark = Opportunity::where('project_name', 'Pueblo de Panay IT Park')->first();
        $resort = Opportunity::where('project_name', 'Coastal Eco-Resort')->first();

        Inquiry::create([
            'opportunity_id' => $seafood ? $seafood->id : null,
            'investor_name' => 'Alexander Wright',
            'email' => 'a.wright@pacificaquagroup.com',
            'company' => 'Pacific Aqua Group International',
            'message' => 'We are interested in co-investing in the cold storage and seafood export processing plant. Requesting official feasibility deck.',
            'status' => 'Pending',
        ]);

        Inquiry::create([
            'opportunity_id' => $itPark ? $itPark->id : null,
            'investor_name' => 'Samantha Mendoza',
            'email' => 'smendoza@nexuscallhubs.ph',
            'company' => 'Nexus BPO & Technology Solutions',
            'message' => 'Exploring 2,000 sq. meter floor space leasing for 24/7 contact center operations within Pueblo de Panay IT Park.',
            'status' => 'Under Review',
            'admin_notes' => 'Initial documentation received. Referred to PEZA desk for local tax rebate verification.',
            'reviewed_at' => now()->subDays(2),
        ]);

        Inquiry::create([
            'opportunity_id' => $resort ? $resort->id : null,
            'investor_name' => 'Marcus Chen',
            'email' => 'marcus.chen@ecostaycapital.com',
            'company' => 'EcoStay Hospitality Capital',
            'message' => 'Submitting letter of intent (LOI) for eco-friendly beach resort development along Pilar coastline.',
            'status' => 'Responded',
            'admin_notes' => 'Proposal reviewed and approved by Provincial Economic Council. Introductory briefing set.',
            'reviewed_at' => now()->subDay(),
        ]);
    }
}
