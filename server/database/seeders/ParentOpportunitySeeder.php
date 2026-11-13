<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Municipality;
use App\Models\Opportunity;
use App\Models\ParentOpportunity;
use Illuminate\Database\Seeder;

class ParentOpportunitySeeder extends Seeder
{
    /**
     * Run the database seeds for Parent Opportunities and Child Projects based on
     * official PEDIPO Capiz Key Investment Sectors and Priority Areas.
     */
    public function run(): void
    {
        $agri = Category::where('name', 'Agri-Industrial')->first();
        $it = Category::where('name', 'Information Tech')->first();
        $tourism = Category::where('name', 'Tourism/Hospitality')->first();
        $infra = Category::where('name', 'Infrastructure')->first();
        $mfg = Category::where('name', 'Manufacturing')->first();

        $defaultIncentiveSummary = 'CAPIZ PROVINCE INVESTMENT AND INCENTIVES CODE: 1st Year (100%), 2nd Year (100%), 3rd Year (100%), 4th Year (50%), 5th Year (25%) local tax exemption rates.';
        $defaultIncentivePackage = "Graduated local tax exemptions under the Capiz Province Investment and Incentives Code:\n• 1st Year: 100% Exemption\n• 2nd Year: 100% Exemption\n• 3rd Year: 100% Exemption\n• 4th Year: 50% Exemption\n• 5th Year: 25% Exemption\nEnd-to-end investment facilitation by PEDIPO Investment Services Division.";

        // -------------------------------------------------------------
        // 1. PARENT: Renewable Energy
        // -------------------------------------------------------------
        $renewable = ParentOpportunity::updateOrCreate(
            ['name' => 'Renewable Energy'],
            [
                'category_id' => $infra?->id,
                'description' => 'Clean energy generation capitalizing on Capiz\'s energy-rich rivers, vast solar irradiation, and coastal wind corridors—solar, battery energy storage systems, mini-hydro, and biomass power.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 1: Panitan Energy Storage Project (PESP) & Solar Power Complex (Flagship featured in brochure)
        Opportunity::updateOrCreate(
            ['project_name' => 'Panitan Energy Storage Project (PESP) & Solar Power Complex'],
            [
                'parent_opportunity_id' => $renewable->id,
                'category_id' => $infra?->id,
                'municipality_id' => 17, // Panitan
                'roi_estimate' => 14.80,
                'land_area' => 35.00,
                'key_incentives' => 'RENEWABLE ENERGY ACT (RA 9513) FISCAL PERKS, ' . $defaultIncentiveSummary . ', DUTY-FREE CAPITAL EQUIPMENT IMPORTATION, PRIORITY TRANSMISSION GRID INTERCONNECTION',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'The first ever energy storage facility in the Province of Capiz, featuring a 20MW / 40MWh battery energy storage system (BESS) integrated with the 90MW Panitan Solar Project developed by EcoSolar Energy Corporation (ESEC). Marks the first private-sector power generation investment in Capiz in 17 years.',
                'image_path' => 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Brgy. Timpas, Panitan, Capiz',
                'source_name' => 'EcoSolar Energy Corporation / PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Child 2: Tapaz Highland Solar Park
        Opportunity::updateOrCreate(
            ['project_name' => 'Tapaz Highland Solar Park'],
            [
                'parent_opportunity_id' => $renewable->id,
                'category_id' => $infra?->id,
                'municipality_id' => 14, // Tapaz
                'roi_estimate' => 12.80,
                'land_area' => 45.00,
                'key_incentives' => 'RENEWABLE ENERGY ACT (RA 9513) INCENTIVES, ' . $defaultIncentiveSummary . ', 7-YEAR INCOME TAX HOLIDAY',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'High-elevation 35MW photovoltaic solar array development with existing grid substation proximity on the central Panay plateau.',
                'image_path' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Barangay San Antonio Plateau, Tapaz, Capiz',
                'source_name' => 'DOE / PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Child 3: Maayon Mini Hydropower Project
        Opportunity::updateOrCreate(
            ['project_name' => 'Maayon Mini Hydropower Project'],
            [
                'parent_opportunity_id' => $renewable->id,
                'category_id' => $infra?->id,
                'municipality_id' => 6, // Maayon
                'roi_estimate' => 11.20,
                'land_area' => 12.50,
                'key_incentives' => $defaultIncentiveSummary . ', CLEAN HYDROELECTRIC FEED-IN PREFERENCES',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Run-of-the-river clean hydroelectric generation station designed for 8MW output capacity utilizing upper river tributaries.',
                'image_path' => 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
                'status' => 'Draft',
                'location' => 'Maayon River Headwaters, Maayon, Capiz',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Child 4: President Roxas Biomass Energy Plant
        Opportunity::updateOrCreate(
            ['project_name' => 'President Roxas Biomass Energy Plant'],
            [
                'parent_opportunity_id' => $renewable->id,
                'category_id' => $infra?->id,
                'municipality_id' => 5, // President Roxas
                'roi_estimate' => 11.40,
                'land_area' => 10.00,
                'key_incentives' => 'RENEWABLE ENERGY ACT INCENTIVES, ' . $defaultIncentiveSummary . ', 7-YEAR INCOME TAX HOLIDAY, DUTY-FREE CLEAN POWER TECH',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Establishment of a 10MW biomass power cogeneration plant utilizing sugarcane bagasse byproduct from Capiz sugarcane farms.',
                'image_path' => 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'President Roxas Sugar Zone, Capiz',
                'source_name' => 'BOI / DOE / PEDIPO',
                'source_url' => 'https://boi.gov.ph',
            ]
        );


        // -------------------------------------------------------------
        // 2. PARENT: Information Technology & Business Process Management (IT-BPM)
        // -------------------------------------------------------------
        $itBpm = ParentOpportunity::updateOrCreate(
            ['name' => 'Information Technology & Business Process Management'],
            [
                'category_id' => $it?->id,
                'description' => 'IT-BPM, digital innovation campuses, software engineering, and customer service delivery centers in Capiz, anchored by 7 hectares in Pueblo de Panay Township.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 1: Pueblo de Panay IT-BPM Industry Park (Featured in brochure: "Seven hectares in Pueblo de Panay Township is dedicated to IT-BPM industry")
        Opportunity::updateOrCreate(
            ['project_name' => 'Pueblo de Panay IT-BPM Industry Park'],
            [
                'parent_opportunity_id' => $itBpm->id,
                'category_id' => $it?->id,
                'municipality_id' => 1, // Roxas City
                'roi_estimate' => 13.50,
                'land_area' => 7.00, // Exactly 7 hectares as highlighted in the brochure
                'key_incentives' => 'PEZA ACCREDITED IT ZONE, ' . $defaultIncentiveSummary . ', 4-6 YEAR INCOME TAX HOLIDAY, 100% FOREIGN OWNERSHIP ALLOWED, REDUNDANT FIBER-OPTIC & POWER BACKUP',
                'incentive_package' => $defaultIncentivePackage . "\n• PEZA 5% Special Corporate Income Tax upon lapse of Income Tax Holiday\n• Redundant fiber-optic telecommunications infrastructure\n• Dedicated PEZA desk facilitation at PEDIPO",
                'description' => 'Seven hectares in Pueblo de Panay Township is dedicated to the IT-BPM industry. Official PEZA-accredited IT and business process outsourcing campus with Grade-A BPO offices, co-working spaces, high-speed fiber telecom loops, and integrated masterplanned township amenities.',
                'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Pueblo de Panay Township, Lawaan, Roxas City, Capiz',
                'source_name' => 'PEDIPO / Pueblo de Panay',
                'source_url' => 'https://pueblodepanay.com',
            ]
        );

        // Also link existing Pueblo de Panay IT Park Phase II if present
        $existingIt = Opportunity::where('project_name', 'Pueblo de Panay IT Park Phase II')->first();
        if ($existingIt) {
            $existingIt->update([
                'parent_opportunity_id' => $itBpm->id,
                'category_id' => $it?->id,
                'land_area' => 7.00,
                'key_incentives' => 'PEZA REGISTERED, ' . $defaultIncentiveSummary . ', 100% FOREIGN OWNERSHIP',
                'incentive_package' => $defaultIncentivePackage,
            ]);
        }


        // -------------------------------------------------------------
        // 3. PARENT: Aquaculture & Fisheries
        // -------------------------------------------------------------
        $aquaculture = ParentOpportunity::updateOrCreate(
            ['name' => 'Aquaculture & Fisheries'],
            [
                'category_id' => $agri?->id,
                'description' => 'Aquaculture & fisheries investments across Capiz—the Seafood Capital of the Philippines—spanning mud crab, oyster, prawn, milkfish, and deep-sea marine processing.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 1: Roxas City Aquaculture Association & Export Hub
        Opportunity::updateOrCreate(
            ['project_name' => 'Roxas City Aquaculture & Seafood Consolidation Hub'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 1, // Roxas City
                'roi_estimate' => 15.20,
                'land_area' => 1610.85,
                'key_incentives' => $defaultIncentiveSummary . ', SEAFOOD CONSOLIDATION GRANTS, PORT CLEARANCE ACCELERATION',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Flagship aquaculture production and export consolidation hub for Roxas City and Northern Panay seafood exporters.',
                'image_path' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Pueblo de Panay Township, Barangay San Vicente Ferrer Avenue, Roxas City',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Child 2: Culasi Port Cold Chain & Seafood Processing Facility
        Opportunity::updateOrCreate(
            ['project_name' => 'Culasi Port Cold Chain Facility'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 1, // Roxas City
                'roi_estimate' => 14.80,
                'land_area' => 3.20,
                'key_incentives' => 'LGU TAX REBATES, ' . $defaultIncentiveSummary . ', PRIORITY PORT CLEARANCES, BLAST FREEZING TECHNICAL GRANTS',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Development of a seafood processing and industrial blast-freezing plant near Culasi Port. Targeted at expanding sustainable export value of Capiz crabs, prawns, and milkfish.',
                'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Culasi Port Road, Roxas City, Capiz',
                'source_name' => 'DTI Capiz / PEDIPO',
                'source_url' => 'https://dti.gov.ph',
            ]
        );

        // Child 3: Panay River Delta Mud Crab Breeding Hatchery
        Opportunity::updateOrCreate(
            ['project_name' => 'Panay River Delta Mud Crab Hatchery'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 4, // Pontevedra
                'roi_estimate' => 16.20,
                'land_area' => 5.00,
                'key_incentives' => 'BFAR TECHNICAL TRAINING SUBSIDY, ' . $defaultIncentiveSummary . ', DUTY-FREE AQUACULTURE FEED INGREDIENT IMPORTS',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Investment in mud crab (Alimango) hatcheries and nursery zones within the Pontevedra river mouth. High global demand makes Pontevedra a premium aquaculture zone.',
                'image_path' => 'https://images.unsplash.com/photo-1553618551-fba689030290?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Panay River Estuary Basin, Pontevedra Coast, Capiz',
                'source_name' => 'BFAR Region VI / PEDIPO',
                'source_url' => 'https://bfar.da.gov.ph',
            ]
        );

        // Child 4: Sapian Bay Commercial Oyster & Green Mussel Concession
        Opportunity::updateOrCreate(
            ['project_name' => 'Sapian Aquaculture'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 11, // Sapi-an
                'roi_estimate' => 15.60,
                'land_area' => 420.50,
                'key_incentives' => $defaultIncentiveSummary . ', SHELLFISH SANITARY CERTIFICATION SUPPORT',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Major commercial oyster and green mussel breeding concession with established shoreline logistics in the sheltered waters of Sapian Bay.',
                'image_path' => 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Sapian Bay Coastal Marine Reserve, Sapi-an, Capiz',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Child 5: Panay Coastal Mariculture Park
        Opportunity::updateOrCreate(
            ['project_name' => 'Panay Coastal Mariculture Park'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 2, // Panay
                'roi_estimate' => 14.10,
                'land_area' => 310.25,
                'key_incentives' => $defaultIncentiveSummary . ', BFAR TECHNICAL ASSISTANCE',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'High-density milkfish and sea bass mariculture cage systems in sheltered coastal waters.',
                'image_path' => 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Barangay Buntod Mangrove Zone, Panay, Capiz',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Child 6: Pilar Marine & Crab Processing Hub
        Opportunity::updateOrCreate(
            ['project_name' => 'Pilar Marine & Crab Processing Hub'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 3, // Pilar
                'roi_estimate' => 13.80,
                'land_area' => 280.00,
                'key_incentives' => $defaultIncentiveSummary . ', FISH LANDING FACILITY CLEARANCE',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Deep-sea crab processing and salt-bed integrated aquaculture farming with direct access to Agtalin Bay.',
                'image_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Agtalin Bay Shoreline, Pilar, Capiz',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );


        // -------------------------------------------------------------
        // 4. PARENT: Tourism - Inland/Island Resort Development
        // -------------------------------------------------------------
        $tourismParent = ParentOpportunity::updateOrCreate(
            ['name' => 'Tourism - Inland/Island Resort Development'],
            [
                'category_id' => $tourism?->id,
                'description' => 'Inland and island resort developments, natural adventure parks, accommodation facilities, heritage, cultural, and pilgrimage tourism across Capiz.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 1: Baybay Beach Convention & MICE Hotel
        Opportunity::updateOrCreate(
            ['project_name' => 'Baybay Beach Convention Hotel'],
            [
                'parent_opportunity_id' => $tourismParent->id,
                'category_id' => $tourism?->id,
                'municipality_id' => 1, // Roxas City
                'roi_estimate' => 15.00,
                'land_area' => 4.50,
                'key_incentives' => 'TOURISM ENTERPRISE ZONE (TEZ) ACCREDITED, ' . $defaultIncentiveSummary . ', 6-YEAR INCOME TAX HOLIDAY, ZERO-RATED VAT ON LOCAL PURCHASES',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Premier 150-room business hotel and conference facility situated directly along the popular Baybay Beach coastline. Positioned to capture regional MICE tourism.',
                'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Baybay Beach, Roxas City, Capiz',
                'source_name' => 'DOT / TIEZA / PEDIPO',
                'source_url' => 'https://tourism.gov.ph',
            ]
        );

        // Child 2: Suhot Cave Eco-Adventure Resort
        Opportunity::updateOrCreate(
            ['project_name' => 'Suhot Cave Eco-Adventure Resort'],
            [
                'parent_opportunity_id' => $tourismParent->id,
                'category_id' => $tourism?->id,
                'municipality_id' => 15, // Dumalag
                'roi_estimate' => 12.00,
                'land_area' => 18.00,
                'key_incentives' => $defaultIncentiveSummary . ', ECO-TOURISM DEVELOPMENT GRANTS',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Masterplanned mountain wellness eco-resort utilizing natural cold spring water pools and spelunking trails near Suhot Cave.',
                'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Barangay Dolores, Dumalag, Capiz',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );


        // -------------------------------------------------------------
        // 5. PARENT: Agro-Industrial & Qualified Manufacturing
        // -------------------------------------------------------------
        $agro = ParentOpportunity::updateOrCreate(
            ['name' => 'Agro-Industrial & Qualified Manufacturing'],
            [
                'category_id' => $mfg?->id ?: $agri?->id,
                'description' => 'All qualified manufacturing activities including agro-processing, feed milling, food processing plants, high-value crop production, and cold storage.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 1: Tapaz Agro-Industrial Processing Facility
        Opportunity::updateOrCreate(
            ['project_name' => 'Tapaz Agro-Industrial Processing Facility'],
            [
                'parent_opportunity_id' => $agro->id,
                'category_id' => $agri?->id,
                'municipality_id' => 14, // Tapaz
                'roi_estimate' => 13.90,
                'land_area' => 8.20,
                'key_incentives' => 'DA EQUIPMENT SUBSIDIES, ' . $defaultIncentiveSummary . ', HIGH-VALUE CROPS PROGRAM MARKETING ASSISTANCE',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Establishing centralized fermentaries, drying facilities, and packaging plants for high-grade organic cacao and coffee beans harvested from highlands of Tapaz and Jamindan.',
                'image_path' => 'https://images.unsplash.com/photo-1507269811115-4c6d9322b260?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Poblacion, Tapaz, Capiz',
                'source_name' => 'DA Region VI / PEDIPO',
                'source_url' => 'https://da.gov.ph',
            ]
        );

        // Child 2: Dumarao Feed Mill & Grain Processing Complex
        Opportunity::updateOrCreate(
            ['project_name' => 'Dumarao Feed Mill & Grain Processing Complex'],
            [
                'parent_opportunity_id' => $agro->id,
                'category_id' => $mfg?->id ?: $agri?->id,
                'municipality_id' => 16, // Dumarao
                'roi_estimate' => 14.20,
                'land_area' => 6.50,
                'key_incentives' => $defaultIncentiveSummary . ', DIRECT HIGHWAY LOGISTICS LINK, CORN & FEEDGRAIN VALUE-ADDING INCENTIVES',
                'incentive_package' => $defaultIncentivePackage,
                'description' => 'Commercial grain drying, feed milling, and pineapple byproduct processing facility connecting central Capiz and Iloilo agrarian trade corridors.',
                'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                'status' => 'Published',
                'location' => 'Dumarao Agro-Industrial Corridor, Dumarao, Capiz',
                'source_name' => 'PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );
    }
}
