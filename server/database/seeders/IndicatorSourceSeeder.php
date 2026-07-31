<?php

namespace Database\Seeders;

use App\Models\IndicatorSource;
use Illuminate\Database\Seeder;

class IndicatorSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            [
                'name' => 'Philippine Statistics Authority',
                'code' => 'PSA',
                'website_url' => 'https://psa.gov.ph',
                'description' => 'The central statistical authority of the Philippine government on primary data collection.',
                'confidence_level' => 'High',
            ],
            [
                'name' => 'Department of Trade and Industry',
                'code' => 'DTI',
                'website_url' => 'https://dti.gov.ph',
                'description' => 'The executive department of the Philippine government tasked as the main economic catalyst for business.',
                'confidence_level' => 'High',
            ],
            [
                'name' => 'Bureau of Local Government Finance',
                'code' => 'BLGF',
                'website_url' => 'https://blgf.gov.ph',
                'description' => 'Maintains local government fiscal financial statistics, including local incomes and expenditures.',
                'confidence_level' => 'High',
            ],
            [
                'name' => 'Department of Agriculture',
                'code' => 'DA',
                'website_url' => 'https://da.gov.ph',
                'description' => 'Government agency responsible for the promotion of agricultural development and growth.',
                'confidence_level' => 'Medium',
            ],
            [
                'name' => 'Bureau of Fisheries and Aquatic Resources',
                'code' => 'BFAR',
                'website_url' => 'https://bfar.da.gov.ph',
                'description' => 'Responsible for the development, improvement, management, and conservation of fisheries resources.',
                'confidence_level' => 'Medium',
            ],
            [
                'name' => 'Department of Tourism',
                'code' => 'DOT',
                'website_url' => 'https://tourism.gov.ph',
                'description' => 'Encourages and promotes tourism as a major socio-economic activity.',
                'confidence_level' => 'High',
            ],
            [
                'name' => 'National Economic and Development Authority',
                'code' => 'NEDA',
                'website_url' => 'https://neda.gov.ph',
                'description' => 'The country\'s premier social and economic development planning and policy coordinating body.',
                'confidence_level' => 'High',
            ],
            [
                'name' => 'Provincial Government of Capiz',
                'code' => 'PEDIPO',
                'website_url' => 'https://capiz.gov.ph',
                'description' => 'Local Provincial Economic Development and Investment Promotion Office records.',
                'confidence_level' => 'High',
            ],
        ];

        foreach ($sources as $source) {
            IndicatorSource::updateOrCreate(
                ['code' => $source['code']],
                $source
            );
        }
    }
}
