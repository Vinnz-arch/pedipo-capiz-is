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

        if ($agri) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Seafood Processing Hub'],
                [
                    'category_id' => $agri->id,
                    'roi_estimate' => 14.50,
                    'land_area' => 2.50,
                    'incentive_package' => 'TAX HOLIDAY (5Y), DUTY-FREE IMPORTS, LOCAL LABOR SUBSIDY',
                    'image_path' => '/images/seafood_hub.png',
                    'status' => 'Published',
                ]
            );
        }

        if ($it) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Pueblo de Panay IT Park'],
                [
                    'category_id' => $it->id,
                    'roi_estimate' => 12.20,
                    'land_area' => 5.00,
                    'incentive_package' => 'PEZA ACCREDITED, TAX INCENTIVES, 100% FOREIGN OWNERSHIP',
                    'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Published',
                ]
            );
        }

        if ($tourism) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Coastal Eco-Resort'],
                [
                    'category_id' => $tourism->id,
                    'roi_estimate' => 18.00,
                    'land_area' => 12.00,
                    'incentive_package' => 'ECO-TOURISM INCENTIVE, CAPITAL DEDUCTION, GREEN BUILD REBATE',
                    'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Draft',
                ]
            );
        }

        if ($infra) {
            Opportunity::firstOrCreate(
                ['project_name' => 'Panay Logistics Hub'],
                [
                    'category_id' => $infra->id,
                    'roi_estimate' => 9.50,
                    'land_area' => 8.50,
                    'incentive_package' => 'INFRASTRUCTURE GRANT, PORT ACCESS DISCOUNTS',
                    'image_path' => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                    'status' => 'Closed',
                ]
            );
        }
    }
}
