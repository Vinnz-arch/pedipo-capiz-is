<?php

namespace Database\Seeders;

use App\Models\DashboardStatistic;
use Illuminate\Database\Seeder;

class DashboardStatisticSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statistics = [
            [
                'metric_key' => 'population',
                'value' => 804952,
                'display_value' => '804,952',
                'unit' => 'Count',
                'reference_year' => 2020,
                'growth_rate' => null,
                'source_name' => 'Philippine Statistics Authority (PSA)',
                'source_url' => 'https://psa.gov.ph/content/2020-census-population-and-housing-2020-cph-population-counts-declared-official-president',
                'source_title' => '2020 Census of Population and Housing (2020 CPH) Population Counts Declared Official',
                'retrieved_at' => now(),
                'status' => 'verified',
                'notes' => 'Official total population of the Province of Capiz proclaimed under Presidential Proclamation No. 1179.',
            ],
            [
                'metric_key' => 'land_area',
                'value' => 2633.17,
                'display_value' => '2,633.17 km²',
                'unit' => 'km²',
                'reference_year' => 2022,
                'growth_rate' => null,
                'source_name' => 'Land Management Bureau (LMB) / DENR & PSA PSGC',
                'source_url' => 'https://psa.gov.ph/classification/psgc/',
                'source_title' => 'Philippine Standard Geographic Code (PSGC) - Province of Capiz Summary',
                'retrieved_at' => now(),
                'status' => 'verified',
                'notes' => 'Official total land surface area across all 17 LGUs of Capiz.',
            ],
            [
                'metric_key' => 'barangays',
                'value' => 473,
                'display_value' => '473',
                'unit' => 'Barangays',
                'reference_year' => 2026,
                'growth_rate' => null,
                'source_name' => 'Philippine Statistics Authority (PSA) - PSGC',
                'source_url' => 'https://psa.gov.ph/classification/psgc/',
                'source_title' => 'PSGC Masterlist of Barangays - Capiz',
                'retrieved_at' => now(),
                'status' => 'verified',
                'notes' => '47 in Roxas City, 426 across 16 Municipalities.',
            ],
            [
                'metric_key' => 'coastline',
                'value' => null,
                'display_value' => 'N/A',
                'unit' => 'km',
                'reference_year' => null,
                'growth_rate' => null,
                'source_name' => 'National Mapping and Resource Information Authority (NAMRIA)',
                'source_url' => 'https://www.namria.gov.ph/',
                'source_title' => 'Official Coastline Survey Not Published in Standard Datasets',
                'retrieved_at' => now(),
                'status' => 'unavailable',
                'notes' => 'No singular official coastline length is published in standard national government datasets. Displayed as N/A per reporting standards.',
            ],
            [
                'metric_key' => 'local_units',
                'value' => 17,
                'display_value' => '1 City + 16 Municipalities',
                'unit' => 'LGUs',
                'reference_year' => 2026,
                'growth_rate' => null,
                'source_name' => 'Department of the Interior and Local Government (DILG) / PSA PSGC',
                'source_url' => 'https://psa.gov.ph/classification/psgc/',
                'source_title' => 'Local Government Units Masterlist - Province of Capiz',
                'retrieved_at' => now(),
                'status' => 'verified',
                'notes' => '1 Component City (Roxas City) and 16 Municipalities.',
            ],
            [
                'metric_key' => 'provincial_gdp',
                'value' => 90.85,
                'display_value' => '₱90.85B',
                'unit' => 'Billion PHP (Constant 2018 Prices)',
                'reference_year' => 2025,
                'growth_rate' => 8.70,
                'source_name' => 'Philippine Statistics Authority (PSA)',
                'source_url' => 'https://psa.gov.ph/statistics/ppa',
                'source_title' => 'Provincial Product Accounts (PPA) of the Philippines - Economic Performance of Capiz',
                'retrieved_at' => now(),
                'status' => 'verified',
                'notes' => 'At constant 2018 prices. 2025 PPA results released August 28, 2026, recording 8.7% growth over 2024 GDP of ₱83.58B.',
            ],
        ];

        foreach ($statistics as $stat) {
            DashboardStatistic::updateOrCreate(
                ['metric_key' => $stat['metric_key']],
                $stat
            );
        }
    }
}
