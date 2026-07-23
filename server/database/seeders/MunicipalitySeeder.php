<?php

namespace Database\Seeders;

use App\Models\Municipality;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MunicipalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $municipalities = [
            [
                'name' => 'Roxas City',
                'class' => 'Component City',
                'population' => 179284,
                'land_area' => 95.07,
                'barangay_count' => 47,
                'key_industries' => 'Commercial Services, Seafood Processing, Aquaculture, Ecotourism',
                'description' => 'The capital of Capiz and known as the Seafood Capital of the Philippines. It serves as the administrative, educational, and commercial center of the province.',
                'website_url' => 'https://roxascity.gov.ph',
            ],
            [
                'name' => 'Panay',
                'class' => '3rd Class',
                'population' => 46114,
                'land_area' => 116.37,
                'barangay_count' => 42,
                'key_industries' => 'Aquaculture, Rice Production, Tourism, Weaving',
                'description' => 'Home to the Santa Monica Parish Church, which houses the largest Christian church bell in Asia, cast from 70 sacks of gold coins.',
                'website_url' => 'https://panaycapiz.gov.ph',
            ],
            [
                'name' => 'Pilar',
                'class' => '3rd Class',
                'population' => 47100,
                'land_area' => 113.84,
                'barangay_count' => 24,
                'key_industries' => 'Sugarcane Farming, Deep Sea Fishing, Poultry Processing',
                'description' => 'Famous for the massive Agtalin Shrine Marian statue overlooking the coast and rich aquaculture zones.',
                'website_url' => 'https://pilarcapiz.gov.ph',
            ],
            [
                'name' => 'Pontevedra',
                'class' => '3rd Class',
                'population' => 49700,
                'land_area' => 100.90,
                'barangay_count' => 26,
                'key_industries' => 'Fishery, Rice cultivation, Salt beds production',
                'description' => 'A municipality located at the eastern mouth of the Panay River basin, abundant in mud crabs and freshwater prawns.',
            ],
            [
                'name' => 'President Roxas',
                'class' => '4th Class',
                'population' => 31400,
                'land_area' => 74.00,
                'barangay_count' => 22,
                'key_industries' => 'Sugarcane Processing, Agriculture, Inland aquaculture',
                'description' => 'Named in honor of the first President of the Third Philippine Republic, Manuel Acuña Roxas. Historically rich in sugar farming.',
            ],
            [
                'name' => 'Maayon',
                'class' => '3rd Class',
                'population' => 40500,
                'land_area' => 178.62,
                'barangay_count' => 32,
                'key_industries' => 'Agro-forestry, Bamboo crafting, Livestock farming',
                'description' => 'A hilly inland town with sprawling sugarcane fields, major bamboo plantations, and potential mineral reserves.',
            ],
            [
                'name' => 'Cuartero',
                'class' => '4th Class',
                'population' => 28700,
                'land_area' => 105.69,
                'barangay_count' => 22,
                'key_industries' => 'Farming, Corn Processing, Cacao development',
                'description' => 'An agricultural municipality positioned along the primary national highway, ideal for logistics and agro-processing investments.',
            ],
            [
                'name' => 'Dao',
                'class' => '4th Class',
                'population' => 33800,
                'land_area' => 88.40,
                'barangay_count' => 20,
                'key_industries' => 'Rice Mills, Brick Making, Traditional handicrafts',
                'description' => 'One of the oldest towns in Capiz, Dao has a robust economy based on rice fields and traditional pottery/brick-making.',
            ],
            [
                'name' => 'Sigma',
                'class' => '4th Class',
                'population' => 31600,
                'land_area' => 101.90,
                'barangay_count' => 21,
                'key_industries' => 'Agro-processing, Organic farming, Coconut processing',
                'description' => 'Declared as a model town for organic agricultural farming practices, prioritizing sustainable development projects.',
            ],
            [
                'name' => 'Mambusao',
                'class' => '3rd Class',
                'population' => 40300,
                'land_area' => 137.56,
                'barangay_count' => 26,
                'key_industries' => 'Higher Education services, Agro-forestry, Livestock feeds',
                'description' => 'Home to the satellite campus of Capiz State University (CAPSU) and a highly diversified agricultural crop supplier.',
            ],
            [
                'name' => 'Sapi-an',
                'class' => '4th Class',
                'population' => 26800,
                'land_area' => 70.36,
                'barangay_count' => 10,
                'key_industries' => 'Oyster & Mussel farming, Sea salt beds, Ecotourism',
                'description' => 'Famous for Sapian Bay, a highly productive sanctuary for oysters and green mussels, yielding premium seafood products.',
            ],
            [
                'name' => 'Ivisan',
                'class' => '5th Class',
                'population' => 31200,
                'land_area' => 54.20,
                'barangay_count' => 15,
                'key_industries' => 'Aquaculture, Small-scale garments, Bamboo weaving',
                'description' => 'A coastal gateway town situated adjacent to Roxas City, offering high potential for industrial warehouse facilities.',
            ],
            [
                'name' => 'Jamindan',
                'class' => '2nd Class',
                'population' => 38400,
                'land_area' => 417.89,
                'barangay_count' => 30,
                'key_industries' => 'Upland crops, Banana plantations, Eco-adventure tourism',
                'description' => 'The third largest municipality in Capiz by land area. It hosts the Camp Peralta military reservation and has vast upland natural forests.',
            ],
            [
                'name' => 'Tapaz',
                'class' => '1st Class',
                'population' => 55200,
                'land_area' => 517.18,
                'barangay_count' => 58,
                'key_industries' => 'Highland vegetables, Organic coffee, Forestry products',
                'description' => 'The largest LGU in Capiz by land area. Celebrated for its highland microclimate, yielding quality vegetable and coffee crops.',
            ],
            [
                'name' => 'Dumalag',
                'class' => '4th Class',
                'population' => 30000,
                'land_area' => 108.94,
                'barangay_count' => 19,
                'key_industries' => 'Industrial Lime, Limestone mining, Caves tourism',
                'description' => 'Known for the famous Suhot Cave and Spring, Dumalag features rich limestone deposits ideal for agricultural lime production.',
            ],
            [
                'name' => 'Dumarao',
                'class' => '2nd Class',
                'population' => 49400,
                'land_area' => 232.56,
                'barangay_count' => 33,
                'key_industries' => 'Pineapple plantations, Feed mills, Agri-tourism',
                'description' => 'A major producer of sweet queen pineapples and agricultural grains. Dumarao holds direct connectivity to Iloilo province.',
            ],
            [
                'name' => 'Panitan',
                'class' => '3rd Class',
                'population' => 42500,
                'land_area' => 89.90,
                'barangay_count' => 26,
                'key_industries' => 'Grain processing, River gravel mining, Small businesses',
                'description' => 'Located along the main tributary of the Panay River, providing a central trade station for inland agrarian communities.',
            ],
        ];

        foreach ($municipalities as $data) {
            $gdp = ($data['name'] === 'Roxas City') ? 28450.50 : (rand(1200, 7500) / 1.00) + (rand(1, 99) / 100.00);
            
            Municipality::updateOrCreate(
                ['name' => $data['name']],
                [
                    'slug' => Str::slug($data['name']),
                    'class' => $data['class'],
                    'population' => $data['population'],
                    'land_area' => $data['land_area'],
                    'barangay_count' => $data['barangay_count'],
                    'gdp' => $gdp,
                    'key_industries' => $data['key_industries'],
                    'description' => $data['description'],
                    'website_url' => $data['website_url'] ?? null,
                    'seal_path' => '/images/municipalities/default_seal.png',
                ]
            );
        }
    }
}
