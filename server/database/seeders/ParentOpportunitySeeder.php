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
     * Run the database seeds for Parent Opportunities and Child Projects.
     */
    public function run(): void
    {
        $agri = Category::where('name', 'Agri-Industrial')->first();
        $it = Category::where('name', 'Information Tech')->first();
        $tourism = Category::where('name', 'Tourism/Hospitality')->first();
        $infra = Category::where('name', 'Infrastructure')->first();

        // -------------------------------------------------------------
        // 1. PARENT: Aquaculture
        // -------------------------------------------------------------
        $aquaculture = ParentOpportunity::updateOrCreate(
            ['name' => 'Aquaculture'],
            [
                'category_id' => $agri?->id,
                'description' => 'Aquaculture investment opportunities across multiple municipalities in Capiz.',
                'status' => 'Published',
                'image_path' => '/images/seafood_hub.png',
            ]
        );

        // Link existing Opportunity (e.g. record with ID 7 or matching project name)
        $existingRoxas = Opportunity::where('project_name', 'like', '%Roxas City Aquaculture%')->first();
        if ($existingRoxas) {
            $existingRoxas->update([
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 1, // Roxas City
                'land_area' => 1610.85,
                'status' => 'Published',
                'location' => $existingRoxas->location ?: 'Pueblo de Panay Township, Barangay San Vicente Ferrer Avenue, Roxas City',
            ]);
        } else {
            Opportunity::create([
                'parent_opportunity_id' => $aquaculture->id,
                'project_name' => 'Roxas City Aquaculture Association',
                'category_id' => $agri?->id,
                'municipality_id' => 1,
                'land_area' => 1610.85,
                'status' => 'Published',
                'location' => 'Pueblo de Panay Township, Barangay San Vicente Ferrer Avenue, Roxas City',
                'description' => 'Flagship aquaculture production and export consolidation hub for Roxas City and Northern Panay.',
                'image_path' => '/images/seafood_hub.png',
            ]);
        }

        // Child 2: Sapian Aquaculture
        Opportunity::updateOrCreate(
            ['project_name' => 'Sapian Aquaculture'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 11, // Sapi-an
                'land_area' => 420.50,
                'status' => 'Published',
                'location' => 'Sapian Bay Coastal Marine Reserve, Sapi-an, Capiz',
                'description' => 'Major commercial oyster and green mussel breeding concession with established shoreline logistics.',
                'image_path' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 3: Pontevedra Aquaculture
        Opportunity::updateOrCreate(
            ['project_name' => 'Pontevedra Aquaculture Development'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 4, // Pontevedra
                'land_area' => 650.00,
                'status' => 'Published',
                'location' => 'Panay River Estuary Basin, Pontevedra, Capiz',
                'description' => 'Brackish-water prawn and mud crab grow-out ponds with direct connection to regional cold-storage distribution.',
                'image_path' => 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 4: Panay Coastal Aquaculture
        Opportunity::updateOrCreate(
            ['project_name' => 'Panay Coastal Mariculture Park'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 2, // Panay
                'land_area' => 310.25,
                'status' => 'Published',
                'location' => 'Barangay Buntod Mangrove Zone, Panay, Capiz',
                'description' => 'High-density milkfish and sea bass mariculture cage systems in sheltered coastal waters.',
                'image_path' => 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 5: Pilar Inland Fishery
        Opportunity::updateOrCreate(
            ['project_name' => 'Pilar Marine & Crab Processing Hub'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 3, // Pilar
                'land_area' => 280.00,
                'status' => 'Published',
                'location' => 'Agtalin Bay Shoreline, Pilar, Capiz',
                'description' => 'Deep-sea crab processing and salt-bed integrated aquaculture farming.',
                'image_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 6: Ivisan Hatchery
        Opportunity::updateOrCreate(
            ['project_name' => 'Ivisan Hatchery & Nursery Complex'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 12, // Ivisan
                'land_area' => 145.60,
                'status' => 'Published',
                'location' => 'Basiao Bay Marine Reserve, Ivisan, Capiz',
                'description' => 'Certified fingerling hatchery and broodstock production facility.',
                'image_path' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // Child 7: President Roxas Brackish Aquaculture
        Opportunity::updateOrCreate(
            ['project_name' => 'President Roxas Polyculture Farm'],
            [
                'parent_opportunity_id' => $aquaculture->id,
                'category_id' => $agri?->id,
                'municipality_id' => 5, // President Roxas
                'land_area' => 520.40,
                'status' => 'Published',
                'location' => 'Barangay Culasi coastal zone, President Roxas, Capiz',
                'description' => 'Modern tiger prawn polyculture facilities with automated water quality management.',
                'image_path' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // -------------------------------------------------------------
        // 2. PARENT: Renewable Energy
        // -------------------------------------------------------------
        $renewable = ParentOpportunity::updateOrCreate(
            ['name' => 'Renewable Energy'],
            [
                'category_id' => $infra?->id,
                'description' => 'Solar, mini-hydro, and biomass power generation development opportunities across Capiz.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
            ]
        );

        Opportunity::updateOrCreate(
            ['project_name' => 'Tapaz Highland Solar Park'],
            [
                'parent_opportunity_id' => $renewable->id,
                'category_id' => $infra?->id,
                'municipality_id' => 14, // Tapaz
                'land_area' => 45.00,
                'status' => 'Published',
                'location' => 'Barangay San Antonio Plateau, Tapaz, Capiz',
                'description' => 'High-elevation 35MW photovoltaic solar array development with existing grid substation proximity.',
                'image_path' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
            ]
        );

        Opportunity::updateOrCreate(
            ['project_name' => 'Maayon Mini Hydropower Project'],
            [
                'parent_opportunity_id' => $renewable->id,
                'category_id' => $infra?->id,
                'municipality_id' => 6, // Maayon
                'land_area' => 12.50,
                'status' => 'Draft',
                'location' => 'Maayon River Headwaters, Maayon, Capiz',
                'description' => 'Run-of-the-river clean hydroelectric generation station designed for 8MW output capacity.',
                'image_path' => 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // -------------------------------------------------------------
        // 3. PARENT: Tourism
        // -------------------------------------------------------------
        $tourismParent = ParentOpportunity::updateOrCreate(
            ['name' => 'Tourism'],
            [
                'category_id' => $tourism?->id,
                'description' => 'Eco-adventure resorts, heritage sanctuaries, and coastal wellness destinations in Capiz.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            ]
        );

        Opportunity::updateOrCreate(
            ['project_name' => 'Suhot Cave Eco-Adventure Resort'],
            [
                'parent_opportunity_id' => $tourismParent->id,
                'category_id' => $tourism?->id,
                'municipality_id' => 15, // Dumalag
                'land_area' => 18.00,
                'status' => 'Published',
                'location' => 'Barangay Dolores, Dumalag, Capiz',
                'description' => 'Masterplanned mountain wellness eco-resort utilizing natural cold spring water pools and spelunking trails.',
                'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // -------------------------------------------------------------
        // 4. PARENT: Agriculture & Agro-Industrial
        // -------------------------------------------------------------
        $agro = ParentOpportunity::updateOrCreate(
            ['name' => 'Agro-Industrial'],
            [
                'category_id' => $agri?->id,
                'description' => 'Modern agri-processing facilities, cold-chain maritime logistics, and grain distribution networks.',
                'status' => 'Published',
                'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
            ]
        );

        Opportunity::updateOrCreate(
            ['project_name' => 'Culasi Port Cold Chain Hub'],
            [
                'parent_opportunity_id' => $agro->id,
                'category_id' => $agri?->id,
                'municipality_id' => 1, // Roxas City
                'land_area' => 3.20,
                'status' => 'Published',
                'location' => 'Culasi Port Compound, Roxas City, Capiz',
                'description' => 'State-of-the-art cold storage and blast freezing facility dedicated to marine exports.',
                'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
            ]
        );
    }
}
