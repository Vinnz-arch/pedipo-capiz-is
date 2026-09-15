<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Msme;
use App\Models\Municipality;
use Illuminate\Database\Seeder;

class MsmeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();
        $municipalities = Municipality::all();

        if ($categories->isEmpty() || $municipalities->isEmpty()) {
            return;
        }

        // Wipe existing records to avoid duplicates during re-seeding
        Msme::truncate();

        $msmes = [
            [
                'business_name' => 'Capiz Dragon Fruit Farm',
                'owner_name' => 'John Doe',
                'category_name' => 'Agri-Industrial', // Agri-Business in image
                'enterprise_type' => 'Small',
                'municipality_name' => 'Panay',
                'barangay' => 'Poblacion',
                'complete_address' => 'Brgy. Poblacion, Panay, Capiz',
                'contact_number' => '09171234567',
                'email_address' => 'info@capizdragonfruit.com',
                'business_description' => 'A premier organic farm specializing in high-yield dragon fruit cultivation, distributing fresh organic crops and fruit derivatives throughout Western Visayas.',
                'products_services' => 'Fresh Dragon Fruits, Dragon Fruit Jam, Dragon Fruit Wine, Organic Compost',
                'logo_path' => null,
                'status' => 'Active',
                'date_registered' => '2024-01-15',
                'latitude' => 11.558333,
                'longitude' => 122.797222,
            ],
            [
                'business_name' => 'Panublion Textiles',
                'owner_name' => 'Jane Smith',
                'category_name' => 'Manufacturing',
                'enterprise_type' => 'Medium',
                'municipality_name' => 'Roxas City',
                'barangay' => 'Tanque',
                'complete_address' => 'Panublion Weaving Center, Tanque, Roxas City',
                'contact_number' => '09209876543',
                'email_address' => 'contact@panublion.com',
                'business_description' => 'A traditional weaving community producing high-grade handwoven fibers, clothing accessories, and export-quality home decor textiles.',
                'products_services' => 'Handwoven Hablon Fabrics, Embroidered Shawls, Native Bags, Table Runners',
                'logo_path' => null,
                'status' => 'Active',
                'date_registered' => '2024-03-22',
                'latitude' => 11.585284,
                'longitude' => 122.753381,
            ],
            [
                'business_name' => 'Blue Horizon Eco-Park',
                'owner_name' => 'Robert Johnson',
                'category_name' => 'Tourism/Hospitality', // Tourism in image
                'enterprise_type' => 'Micro',
                'municipality_name' => 'Ivisan',
                'barangay' => 'Basiao',
                'complete_address' => 'Coastal Ridge road, Basiao, Ivisan',
                'contact_number' => '09085554321',
                'email_address' => 'stay@bluehorizon.com',
                'business_description' => 'Eco-tourism park and beachfront cabins that offer snorkeling, nature trails, and native accommodations focusing on conservation.',
                'products_services' => 'Beachfront Cabins, Guided Nature Walks, Kayak Rentals, Coastal Dining',
                'logo_path' => null,
                'status' => 'Active',
                'date_registered' => '2023-11-05',
                'latitude' => 11.528333,
                'longitude' => 122.683333,
            ],
            [
                'business_name' => 'Capiz Tech Solutions',
                'owner_name' => 'Maria Santos',
                'category_name' => 'Information Tech', // Services in image
                'enterprise_type' => 'Small',
                'municipality_name' => 'Roxas City',
                'barangay' => 'Pueblo De Panay',
                'complete_address' => 'TechHub Phase 2, Pueblo De Panay, Roxas City',
                'contact_number' => '09181112222',
                'email_address' => 'support@capiztech.com',
                'business_description' => 'IT consultancy and testing lab providing web design, custom business automation software, and electronics repair services.',
                'products_services' => 'Software Development, Web Hosting, IT Support Consulting, Networking Solutions',
                'logo_path' => null,
                'status' => 'Active',
                'date_registered' => '2025-05-18',
                'latitude' => 11.565284,
                'longitude' => 122.743381,
            ],
            [
                'business_name' => 'Seafood Bounty Exports',
                'owner_name' => 'Lourdes Dela Cruz',
                'category_name' => 'Agri-Industrial', // Agri-Business in image
                'enterprise_type' => 'Medium',
                'municipality_name' => 'Pontevedra',
                'barangay' => 'Sublangon',
                'complete_address' => 'Crab Processing Area, Sublangon, Pontevedra',
                'contact_number' => '09998887776',
                'email_address' => 'exports@seafoodbounty.com',
                'business_description' => 'Commercial seafood processing plant and distributor of high-demand mud crabs, tiger prawns, and oysters to Asian markets.',
                'products_services' => 'Export mud crabs, Frozen Tiger Prawns, Preserved Oysters, Cold Chain Delivery',
                'logo_path' => null,
                'status' => 'Active',
                'date_registered' => '2026-06-10',
                'latitude' => 11.488333,
                'longitude' => 122.833333,
            ],
            [
                'business_name' => 'Shelluxe Artisans',
                'owner_name' => 'David Tan',
                'category_name' => 'Manufacturing',
                'enterprise_type' => 'Small',
                'municipality_name' => 'Sigma',
                'barangay' => 'Mianay',
                'complete_address' => 'Brgy. Mianay, Sigma, Capiz',
                'contact_number' => '09228881234',
                'email_address' => 'artisan@shelluxe.com',
                'business_description' => 'Boutique manufacturer crafting luxury lamps, window panels, and tiles from raw Capiz oyster shells, highlighting native Capiz artistry.',
                'products_services' => 'Capiz Shell Lamps, Translucent Shell Tiles, Window Panes, Custom Chandeliers',
                'logo_path' => null,
                'status' => 'Active',
                'date_registered' => '2024-08-01',
                'latitude' => 11.428333,
                'longitude' => 122.570833,
            ]
        ];

        foreach ($msmes as $data) {
            $category = $categories->firstWhere('name', $data['category_name']);
            $municipality = $municipalities->firstWhere('name', $data['municipality_name']);

            Msme::create([
                'business_name' => $data['business_name'],
                'owner_name' => $data['owner_name'],
                'category_id' => $category ? $category->id : null,
                'enterprise_type' => $data['enterprise_type'],
                'municipality_id' => $municipality ? $municipality->id : null,
                'barangay' => $data['barangay'],
                'complete_address' => $data['complete_address'],
                'contact_number' => $data['contact_number'],
                'email_address' => $data['email_address'],
                'business_description' => $data['business_description'],
                'products_services' => $data['products_services'],
                'logo_path' => $data['logo_path'],
                'status' => $data['status'],
                'date_registered' => $data['date_registered'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'is_archived' => false,
            ]);
        }
    }
}
