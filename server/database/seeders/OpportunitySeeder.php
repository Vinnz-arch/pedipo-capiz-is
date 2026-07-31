<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Opportunity;
use App\Models\Municipality;
use Illuminate\Database\Seeder;

class OpportunitySeeder extends Seeder
{
    /**
     * Run the database seeds with legitimate Capiz LGU and DTI priority investment areas.
     */
    public function run(): void
    {
        $agri = Category::where('name', 'Agri-Industrial')->first();
        $it = Category::where('name', 'Information Tech')->first();
        $tourism = Category::where('name', 'Tourism/Hospitality')->first();
        $infra = Category::where('name', 'Infrastructure')->first();
        $mfg = Category::where('name', 'Manufacturing')->first();

        $roxas = Municipality::where('name', 'Roxas City')->first();
        $pontevedra = Municipality::where('name', 'Pontevedra')->first();
        $pilar = Municipality::where('name', 'Pilar')->first();
        $presRoxas = Municipality::where('name', 'President Roxas')->first();
        $tapaz = Municipality::where('name', 'Tapaz')->first();
        $panay = Municipality::where('name', 'Panay')->first();

        // 1. Pueblo de Panay IT Park (Information Tech, Roxas City) - Legit PEZA Zone
        if ($it) {
            Opportunity::updateOrCreate(
                ['project_name' => 'Pueblo de Panay IT Park Phase II'],
                [
                    'category_id' => $it->id,
                    'municipality_id' => $roxas?->id,
                    'roi_estimate' => 12.50,
                    'land_area' => 7.50,
                    'key_incentives' => 'PEZA REGISTERED, INCOME TAX HOLIDAY (4-6 YEARS), 100% FOREIGN OWNERSHIP ALLOWED, DUTY-FREE IMPORT OF CAPITAL EQUIPMENT',
                    'description' => 'Official PEZA-accredited IT and business process outsourcing zone. Expansion includes green building campus spaces, redundant high-speed fiber-optic linkages, and dedicated substation power facilities.',
                    'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'Lawaan, Roxas City, Capiz',
                    'source_name' => 'PEDIPO / PEZA Directory',
                    'source_url' => 'https://www.peza.gov.ph',
                ]
            );
        }

        // 2. Culasi Port Cold Chain & Seafood Processing Hub (Agri-Industrial, Roxas City) - Legit DTI Priority
        if ($agri) {
            Opportunity::updateOrCreate(
                ['project_name' => 'Culasi Port Cold Chain Facility'],
                [
                    'category_id' => $agri->id,
                    'municipality_id' => $roxas?->id,
                    'roi_estimate' => 14.80,
                    'land_area' => 3.20,
                    'key_incentives' => 'LGU TAX REBATES, REVENUE EXEMPTION FOR FIRST 3 YEARS, PRIORITY PORT CLEARANCES, CO-FINANCING GRANTS',
                    'description' => 'Development of a seafood processing and industrial blast-freezing plant near Culasi Port (the maritime gateway of Capiz). Targeted at expanding sustainable export value of Capiz crabs, prawns, and milkfish.',
                    'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'Culasi Port Road, Roxas City, Capiz',
                    'source_name' => 'DTI Capiz / PEDIPO',
                    'source_url' => 'https://dti.gov.ph',
                ]
            );
        }

        // 3. Panay River Delta Mud Crab Breeding Center (Agri-Industrial, Pontevedra) - Legit BFAR Priority
        if ($agri) {
            Opportunity::updateOrCreate(
                ['project_name' => 'Panay River Delta Mud Crab Hatchery'],
                [
                    'category_id' => $agri->id,
                    'municipality_id' => $pontevedra?->id,
                    'roi_estimate' => 16.20,
                    'land_area' => 5.00,
                    'key_incentives' => 'BFAR TECHNICAL TRAINING SUBSIDY, DUTY-FREE AQUACULTURE FEED INGREDIENT IMPORTS, TAX INCENTIVES',
                    'description' => 'Investment in mud crab (Alimango) hatcheries and nursery zones within the Pontevedra river mouth. High global demand from East Asia makes Pontevedra a premium aquaculture zone.',
                    'image_path' => 'https://images.unsplash.com/photo-1553618551-fba689030290?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'Pontevedra Coast, Capiz',
                    'source_name' => 'BFAR Region VI',
                    'source_url' => 'https://bfar.da.gov.ph',
                ]
            );
        }

        // 4. Baybay Beach Convention & MICE Hotel (Tourism, Roxas City) - Legit DOT Promotion
        if ($tourism) {
            Opportunity::updateOrCreate(
                ['project_name' => 'Baybay Beach Convention Hotel'],
                [
                    'category_id' => $tourism->id,
                    'municipality_id' => $roxas?->id,
                    'roi_estimate' => 15.00,
                    'land_area' => 4.50,
                    'key_incentives' => 'TOURISM ENTERPRISE ZONE (TEZ) ACCREDITED, 6-YEAR INCOME TAX HOLIDAY, ZERO-RATED VAT ON LOCAL PURCHASES',
                    'description' => 'Premier 150-room business hotel and conference facility situated directly along the popular Baybay Beach coastline. Positioned to capture growing regional MICE (Meetings, Incentives, Conferences, Exhibitions) tourism.',
                    'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'Baybay Beach, Roxas City, Capiz',
                    'source_name' => 'DOT / TIEZA',
                    'source_url' => 'https://tourism.gov.ph',
                ]
            );
        }

        // 5. Pres. Roxas Sugar Mill Biomass & Bioethanol Plant (Manufacturing, Pres. Roxas) - Legit BOI Priority
        if ($infra) {
            Opportunity::updateOrCreate(
                ['project_name' => 'President Roxas Biomass Energy Plant'],
                [
                    'category_id' => $infra->id,
                    'municipality_id' => $presRoxas?->id,
                    'roi_estimate' => 11.40,
                    'land_area' => 10.00,
                    'key_incentives' => 'RENEWABLE ENERGY ACT INCENTIVES, 7-YEAR INCOME TAX HOLIDAY, duty-free importing of clean energy tech, carbon credit certifications',
                    'description' => 'Establishment of a 10MW biomass power cogeneration plant utilizing sugarcane bagasse byproduct from Capiz sugarcane farms. Integrates bioethanol production capabilities to support national green fuel requirements.',
                    'image_path' => 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'President Roxas Sugar Zone, Capiz',
                    'source_name' => 'BOI / Department of Energy',
                    'source_url' => 'https://boi.gov.ph',
                ]
            );
        }

        // 6. Central Capiz Highland Cacao and Coffee Processing Hub (Agri-Industrial, Tapaz) - Legit DA Priority
        if ($agri) {
            Opportunity::updateOrCreate(
                ['project_name' => 'Tapaz Agro-Industrial Processing Facility'],
                [
                    'category_id' => $agri->id,
                    'municipality_id' => $tapaz?->id,
                    'roi_estimate' => 13.90,
                    'land_area' => 8.20,
                    'key_incentives' => 'DA EQUIPMENT SUBSIDIES, REDUCED LOCAL LGU BUSINESS TAXES, HIGH-VALUE CROPS PROGRAM MARKETING ASSISTANCE',
                    'description' => 'Establishing centralized fermentaries, drying facilities, and packaging plants for high-grade organic cacao and coffee beans harvested from highlands of Tapaz and Jamindan.',
                    'image_path' => 'https://images.unsplash.com/photo-1507269811115-4c6d9322b260?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                    'location' => 'Poblacion, Tapaz, Capiz',
                    'source_name' => 'DA Region VI',
                    'source_url' => 'https://da.gov.ph',
                ]
            );
        }
    }
}
