<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Opportunity;
use Illuminate\Database\Seeder;

class OpportunitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agri = Category::where('name', 'Agri-Industrial')->first();
        $it = Category::where('name', 'Information Tech')->first();
        $tourism = Category::where('name', 'Tourism/Hospitality')->first();
        $infra = Category::where('name', 'Infrastructure')->first();

        $roxas = \App\Models\Municipality::where('name', 'Roxas City')->first();
        $pilar = \App\Models\Municipality::where('name', 'Pilar')->first();
        $panay = \App\Models\Municipality::where('name', 'Panay')->first();

        if ($agri) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Seafood Processing Hub'],
                [
                    'category_id' => $agri->id,
                    'municipality_id' => $roxas?->id,
                    'roi_estimate' => 14.50,
                    'land_area' => 2.50,
                    'key_incentives' => 'TAX HOLIDAY (5Y), DUTY-FREE IMPORTS, LOCAL LABOR SUBSIDY',
                    'description' => 'Proposed centralized processing facility for sustainable aquamarine exports. Strategically located near the Roxas City Airport and Culasi Port.',
                    'image_path' => '/images/seafood_hub.png',
                    'status' => 'Published',
                    'location' => 'Roxas City, Capiz',
                ]
            );
        }

        if ($it) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Pueblo de Panay IT Park'],
                [
                    'category_id' => $it->id,
                    'municipality_id' => $roxas?->id,
                    'roi_estimate' => 12.20,
                    'land_area' => 5.00,
                    'key_incentives' => 'PEZA ACCREDITED, TAX INCENTIVES, 100% FOREIGN OWNERSHIP',
                    'description' => 'Modern IT business park supporting BPOs, tech hubs, and innovation centers with redundant fiber optic connections and power security.',
                    'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'Roxas City, Capiz',
                ]
            );
        }

        if ($tourism) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Coastal Eco-Resort'],
                [
                    'category_id' => $tourism->id,
                    'municipality_id' => $pilar?->id,
                    'roi_estimate' => 18.00,
                    'land_area' => 12.00,
                    'key_incentives' => 'ECO-TOURISM INCENTIVE, CAPITAL DEDUCTION, GREEN BUILD REBATE',
                    'description' => 'Luxury eco-friendly beach resort development along the pristine coastlines of Pilar, designed for sustainable tourism and wellness.',
                    'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Draft',
                    'location' => 'Pilar, Capiz',
                ]
            );
        }

        if ($infra) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Panay Logistics Hub'],
                [
                    'category_id' => $infra->id,
                    'municipality_id' => $panay?->id,
                    'roi_estimate' => 9.50,
                    'land_area' => 8.50,
                    'key_incentives' => 'INFRASTRUCTURE GRANT, PORT ACCESS DISCOUNTS',
                    'description' => 'Integrated warehousing and cold-chain facility strategically placed along Panay highway interconnecting Capiz and neighbor provinces.',
                    'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Closed',
                    'location' => 'Panay, Capiz',
                ]
            );
        }
    }
}
