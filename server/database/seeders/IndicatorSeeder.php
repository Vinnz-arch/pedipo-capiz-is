<?php

namespace Database\Seeders;

use App\Models\Indicator;
use Illuminate\Database\Seeder;

class IndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $indicators = [
            [
                'name' => 'Population',
                'code' => 'population',
                'category' => 'demographic',
                'unit' => 'Count',
                'description' => 'Total population count in the municipality.',
            ],
            [
                'name' => 'Land Area',
                'code' => 'land_area',
                'category' => 'demographic',
                'unit' => 'sq km',
                'description' => 'Total land surface area in square kilometers.',
            ],
            [
                'name' => 'Gross Domestic Product (GDP)',
                'code' => 'gdp',
                'category' => 'economic',
                'unit' => 'Million PHP',
                'description' => 'Estimated annual Gross Domestic Product in millions of Philippine Pesos.',
            ],
            [
                'name' => 'Employment Rate',
                'code' => 'employment_rate',
                'category' => 'economic',
                'unit' => '%',
                'description' => 'Percentage of the labor force that is currently employed.',
            ],
            [
                'name' => 'Registered Businesses',
                'code' => 'registered_businesses',
                'category' => 'economic',
                'unit' => 'Count',
                'description' => 'Total active registered businesses within the fiscal year.',
            ],
            [
                'name' => 'Foreign Direct Investment (FDI)',
                'code' => 'fdi',
                'category' => 'economic',
                'unit' => 'Million PHP',
                'description' => 'Total recorded Foreign Direct Investment in millions of Philippine Pesos.',
            ],
            [
                'name' => 'Municipal Income',
                'code' => 'municipal_income',
                'category' => 'economic',
                'unit' => 'Million PHP',
                'description' => 'Annual local government unit revenue and income.',
            ],
            [
                'name' => 'Investment Value',
                'code' => 'investment',
                'category' => 'economic',
                'unit' => 'Million PHP',
                'description' => 'Total recorded commercial and domestic investments.',
            ],
            [
                'name' => 'Aquaculture Share',
                'code' => 'aquaculture_share',
                'category' => 'sectoral',
                'unit' => '%',
                'description' => 'Percentage share of aquaculture in the local economy distribution.',
            ],
            [
                'name' => 'Agriculture Share',
                'code' => 'agriculture_share',
                'category' => 'sectoral',
                'unit' => '%',
                'description' => 'Percentage share of agriculture in the local economy distribution.',
            ],
            [
                'name' => 'Tourism Share',
                'code' => 'tourism_share',
                'category' => 'sectoral',
                'unit' => '%',
                'description' => 'Percentage share of tourism and hospitality in the local economy.',
            ],
            [
                'name' => 'Manufacturing Share',
                'code' => 'manufacturing_share',
                'category' => 'sectoral',
                'unit' => '%',
                'description' => 'Percentage share of manufacturing and industrial processing.',
            ],
            [
                'name' => 'Services Share',
                'code' => 'services_share',
                'category' => 'sectoral',
                'unit' => '%',
                'description' => 'Percentage share of tertiary services and commercial shops.',
            ],
            [
                'name' => 'Infrastructure Rating',
                'code' => 'infrastructure',
                'category' => 'infrastructure',
                'unit' => 'Score',
                'description' => 'LGU infrastructure index rating score out of 100.',
            ],
        ];

        foreach ($indicators as $indicator) {
            Indicator::updateOrCreate(
                ['code' => $indicator['code']],
                $indicator
            );
        }
    }
}
