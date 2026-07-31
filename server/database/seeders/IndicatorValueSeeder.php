<?php

namespace Database\Seeders;

use App\Models\Indicator;
use App\Models\IndicatorSource;
use App\Models\IndicatorValue;
use App\Models\Municipality;
use Illuminate\Database\Seeder;

class IndicatorValueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = IndicatorSource::all()->pluck('id', 'code')->toArray();
        $indicators = Indicator::all()->pluck('id', 'code')->toArray();
        $municipalities = Municipality::all();

        // Standard baseline metrics
        $metrics = [
            'Roxas City' => [
                'gdp' => 18.5,
                'employment_rate' => 96.8,
                'registered_businesses' => 1245,
                'fdi' => 2.3,
                'municipal_income' => 742.5,
                'investment' => 450.2,
                'aquaculture_share' => 25.0,
                'agriculture_share' => 15.0,
                'tourism_share' => 18.0,
                'manufacturing_share' => 22.0,
                'services_share' => 20.0,
                'infrastructure' => 88.0,
            ],
            'Pontevedra' => [
                'gdp' => 10.3,
                'employment_rate' => 96.7,
                'registered_businesses' => 378,
                'fdi' => 0.58,
                'municipal_income' => 158.4,
                'investment' => 64.8,
                'aquaculture_share' => 18.0,
                'agriculture_share' => 38.0,
                'tourism_share' => 15.0,
                'manufacturing_share' => 19.0,
                'services_share' => 10.0,
                'infrastructure' => 72.0,
            ],
            'Pilar' => [
                'gdp' => 9.1,
                'employment_rate' => 96.6,
                'registered_businesses' => 342,
                'fdi' => 0.52,
                'municipal_income' => 142.1,
                'investment' => 52.3,
                'aquaculture_share' => 30.0,
                'agriculture_share' => 28.0,
                'tourism_share' => 20.0,
                'manufacturing_share' => 14.0,
                'services_share' => 8.0,
                'infrastructure' => 68.0,
            ],
            'Panay' => [
                'gdp' => 8.5,
                'employment_rate' => 96.2,
                'registered_businesses' => 295,
                'fdi' => 0.45,
                'municipal_income' => 135.0,
                'investment' => 48.0,
                'aquaculture_share' => 35.0,
                'agriculture_share' => 32.0,
                'tourism_share' => 15.0,
                'manufacturing_share' => 10.0,
                'services_share' => 8.0,
                'infrastructure' => 70.0,
            ],
            'Cuartero' => [
                'gdp' => 5.2,
                'employment_rate' => 95.1,
                'registered_businesses' => 112,
                'fdi' => 0.12,
                'municipal_income' => 88.3,
                'investment' => 15.4,
                'aquaculture_share' => 5.0,
                'agriculture_share' => 65.0,
                'tourism_share' => 5.0,
                'manufacturing_share' => 15.0,
                'services_share' => 10.0,
                'infrastructure' => 58.0,
            ],
            'Dao' => [
                'gdp' => 6.1,
                'employment_rate' => 95.4,
                'registered_businesses' => 154,
                'fdi' => 0.18,
                'municipal_income' => 95.2,
                'investment' => 22.1,
                'aquaculture_share' => 8.0,
                'agriculture_share' => 55.0,
                'tourism_share' => 8.0,
                'manufacturing_share' => 17.0,
                'services_share' => 12.0,
                'infrastructure' => 60.0,
            ],
            'Ivisan' => [
                'gdp' => 7.8,
                'employment_rate' => 96.0,
                'registered_businesses' => 245,
                'fdi' => 0.38,
                'municipal_income' => 120.4,
                'investment' => 36.5,
                'aquaculture_share' => 28.0,
                'agriculture_share' => 22.0,
                'tourism_share' => 18.0,
                'manufacturing_share' => 18.0,
                'services_share' => 14.0,
                'infrastructure' => 74.0,
            ],
        ];

        // Generic fallback values for other municipalities
        $fallback = [
            'gdp' => 5.8,
            'employment_rate' => 95.5,
            'registered_businesses' => 150,
            'fdi' => 0.2,
            'municipal_income' => 90.0,
            'investment' => 20.0,
            'aquaculture_share' => 10.0,
            'agriculture_share' => 50.0,
            'tourism_share' => 10.0,
            'manufacturing_share' => 15.0,
            'services_share' => 15.0,
            'infrastructure' => 62.0,
        ];

        $year = 2025; // baseline year

        foreach ($municipalities as $muni) {
            $muniMetrics = $metrics[$muni->name] ?? $fallback;

            // Seed demographic values directly from municipalities table
            if (isset($indicators['population'])) {
                IndicatorValue::updateOrCreate(
                    [
                        'municipality_id' => $muni->id,
                        'indicator_id' => $indicators['population'],
                        'year' => $year,
                        'quarter' => null,
                    ],
                    [
                        'source_id' => $sources['PSA'],
                        'value' => $muni->population,
                        'verification_status' => 'verified',
                    ]
                );
            }

            if (isset($indicators['land_area'])) {
                IndicatorValue::updateOrCreate(
                    [
                        'municipality_id' => $muni->id,
                        'indicator_id' => $indicators['land_area'],
                        'year' => $year,
                        'quarter' => null,
                    ],
                    [
                        'source_id' => $sources['PSA'],
                        'value' => $muni->land_area,
                        'verification_status' => 'verified',
                    ]
                );
            }

            // Seed other economic & sectoral metrics
            foreach ($muniMetrics as $indCode => $val) {
                if (!isset($indicators[$indCode])) continue;

                // Determine appropriate source
                $srcCode = 'PSA';
                if (in_array($indCode, ['registered_businesses', 'fdi', 'investment'])) {
                    $srcCode = 'DTI';
                } elseif (in_array($indCode, ['municipal_income'])) {
                    $srcCode = 'BLGF';
                } elseif ($indCode === 'aquaculture_share') {
                    $srcCode = 'BFAR';
                } elseif ($indCode === 'agriculture_share') {
                    $srcCode = 'DA';
                } elseif ($indCode === 'tourism_share') {
                    $srcCode = 'DOT';
                } elseif ($indCode === 'infrastructure') {
                    $srcCode = 'PEDIPO';
                }

                IndicatorValue::updateOrCreate(
                    [
                        'municipality_id' => $muni->id,
                        'indicator_id' => $indicators[$indCode],
                        'year' => $year,
                        'quarter' => null,
                    ],
                    [
                        'source_id' => $sources[$srcCode] ?? $sources['PSA'],
                        'value' => $val,
                        'verification_status' => 'verified',
                    ]
                );
            }
        }
    }
}
