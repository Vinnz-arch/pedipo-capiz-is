<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Municipality extends Model
{
    // Turn off database connection/table matching for queries
    protected $table = 'municipalities';
    
    // Static data of Capiz LGUs
    protected static $staticData = [
        [
            'id' => 1,
            'name' => 'Roxas City',
            'slug' => 'roxas-city',
            'class' => 'Component City',
            'population' => 179284,
            'land_area' => 95.07,
            'barangay_count' => 47,
            'gdp' => 28450.50,
            'key_industries' => 'Commercial Services, Seafood Processing, Aquaculture, Ecotourism',
            'description' => 'The capital of Capiz and known as the Seafood Capital of the Philippines. It serves as the administrative, educational, and commercial center of the province.',
            'website_url' => 'https://roxascity.gov.ph',
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 2,
            'name' => 'Panay',
            'slug' => 'panay',
            'class' => '3rd Class',
            'population' => 46114,
            'land_area' => 116.37,
            'barangay_count' => 42,
            'gdp' => 3450.15,
            'key_industries' => 'Aquaculture, Rice Production, Tourism, Weaving',
            'description' => 'Home to the Santa Monica Parish Church, which houses the largest Christian church bell in Asia, cast from 70 sacks of gold coins.',
            'website_url' => 'https://panaycapiz.gov.ph',
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 3,
            'name' => 'Pilar',
            'slug' => 'pilar',
            'class' => '3rd Class',
            'population' => 47100,
            'land_area' => 113.84,
            'barangay_count' => 24,
            'gdp' => 3120.45,
            'key_industries' => 'Sugarcane Farming, Deep Sea Fishing, Poultry Processing',
            'description' => 'Famous for the massive Agtalin Shrine Marian statue overlooking the coast and rich aquaculture zones.',
            'website_url' => 'https://pilarcapiz.gov.ph',
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 4,
            'name' => 'Pontevedra',
            'slug' => 'pontevedra',
            'class' => '3rd Class',
            'population' => 49700,
            'land_area' => 100.90,
            'barangay_count' => 26,
            'gdp' => 4210.80,
            'key_industries' => 'Fishery, Rice cultivation, Salt beds production',
            'description' => 'A municipality located at the eastern mouth of the Panay River basin, abundant in mud crabs and freshwater prawns.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 5,
            'name' => 'President Roxas',
            'slug' => 'president-roxas',
            'class' => '4th Class',
            'population' => 31400,
            'land_area' => 74.00,
            'barangay_count' => 22,
            'gdp' => 2340.50,
            'key_industries' => 'Sugarcane Processing, Agriculture, Inland aquaculture',
            'description' => 'Named in honor of the first President of the Third Philippine Republic, Manuel Acuña Roxas. Historically rich in sugar farming.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 6,
            'name' => 'Maayon',
            'slug' => 'maayon',
            'class' => '3rd Class',
            'population' => 40500,
            'land_area' => 178.62,
            'barangay_count' => 32,
            'gdp' => 2980.20,
            'key_industries' => 'Agro-forestry, Bamboo crafting, Livestock farming',
            'description' => 'A hilly inland town with sprawling sugarcane fields, major bamboo plantations, and potential mineral reserves.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 7,
            'name' => 'Cuartero',
            'slug' => 'cuartero',
            'class' => '4th Class',
            'population' => 28700,
            'land_area' => 105.69,
            'barangay_count' => 22,
            'gdp' => 1890.30,
            'key_industries' => 'Farming, Corn Processing, Cacao development',
            'description' => 'An agricultural municipality positioned along the primary national highway, ideal for logistics and agro-processing investments.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 8,
            'name' => 'Dao',
            'slug' => 'dao',
            'class' => '4th Class',
            'population' => 33800,
            'land_area' => 88.40,
            'barangay_count' => 20,
            'gdp' => 2150.40,
            'key_industries' => 'Rice Mills, Brick Making, Traditional handicrafts',
            'description' => 'One of the oldest towns in Capiz, Dao has a robust economy based on rice fields and traditional pottery/brick-making.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 9,
            'name' => 'Sigma',
            'slug' => 'sigma',
            'class' => '4th Class',
            'population' => 31600,
            'land_area' => 101.90,
            'barangay_count' => 21,
            'gdp' => 2420.60,
            'key_industries' => 'Agro-processing, Organic farming, Coconut processing',
            'description' => 'Declared as a model town for organic agricultural farming practices, prioritizing sustainable development projects.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 10,
            'name' => 'Mambusao',
            'slug' => 'mambusao',
            'class' => '3rd Class',
            'population' => 40300,
            'land_area' => 137.56,
            'barangay_count' => 26,
            'gdp' => 3890.75,
            'key_industries' => 'Higher Education services, Agro-forestry, Livestock feeds',
            'description' => 'Home to the satellite campus of Capiz State University (CAPSU) and a highly diversified agricultural crop supplier.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 11,
            'name' => 'Sapi-an',
            'slug' => 'sapi-an',
            'class' => '4th Class',
            'population' => 26800,
            'land_area' => 70.36,
            'barangay_count' => 10,
            'gdp' => 1980.10,
            'key_industries' => 'Oyster & Mussel farming, Sea salt beds, Ecotourism',
            'description' => 'Famous for Sapian Bay, a highly productive sanctuary for oysters and green mussels, yielding premium seafood products.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 12,
            'name' => 'Ivisan',
            'slug' => 'ivisan',
            'class' => '5th Class',
            'population' => 31200,
            'land_area' => 54.20,
            'barangay_count' => 15,
            'gdp' => 1760.85,
            'key_industries' => 'Aquaculture, Small-scale garments, Bamboo weaving',
            'description' => 'A coastal gateway town situated adjacent to Roxas City, offering high potential for industrial warehouse facilities.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 13,
            'name' => 'Jamindan',
            'slug' => 'jamindan',
            'class' => '2nd Class',
            'population' => 38400,
            'land_area' => 417.89,
            'barangay_count' => 30,
            'gdp' => 4120.90,
            'key_industries' => 'Upland crops, Banana plantations, Eco-adventure tourism',
            'description' => 'The third largest municipality in Capiz by land area. It hosts the Camp Peralta military reservation and has vast upland natural forests.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 14,
            'name' => 'Tapaz',
            'slug' => 'tapaz',
            'class' => '1st Class',
            'population' => 55200,
            'land_area' => 517.18,
            'barangay_count' => 58,
            'gdp' => 6540.25,
            'key_industries' => 'Highland vegetables, Organic coffee, Forestry products',
            'description' => 'The largest LGU in Capiz by land area. Celebrated for its highland microclimate, yielding quality vegetable and coffee crops.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 15,
            'name' => 'Dumalag',
            'slug' => 'dumalag',
            'class' => '4th Class',
            'population' => 30000,
            'land_area' => 108.94,
            'barangay_count' => 19,
            'gdp' => 2210.60,
            'key_industries' => 'Industrial Lime, Limestone mining, Caves tourism',
            'description' => 'Known for the famous Suhot Cave and Spring, Dumalag features rich limestone deposits ideal for agricultural lime production.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 16,
            'name' => 'Dumarao',
            'slug' => 'dumarao',
            'class' => '2nd Class',
            'population' => 49400,
            'land_area' => 232.56,
            'barangay_count' => 33,
            'gdp' => 5430.40,
            'key_industries' => 'Pineapple plantations, Feed mills, Agri-tourism',
            'description' => 'A major producer of sweet queen pineapples and agricultural grains. Dumarao holds direct connectivity to Iloilo province.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
        [
            'id' => 17,
            'name' => 'Panitan',
            'slug' => 'panitan',
            'class' => '3rd Class',
            'population' => 42500,
            'land_area' => 89.90,
            'barangay_count' => 26,
            'gdp' => 3320.70,
            'key_industries' => 'Grain processing, River gravel mining, Small businesses',
            'description' => 'Located along the main tributary of the Panay River, providing a central trade station for inland agrarian communities.',
            'website_url' => null,
            'seal_path' => '/images/municipalities/default_seal.png',
        ],
    ];

    /**
     * Map raw array to model instances
     */
    protected static function mapToModels(array $items)
    {
        return collect($items)->map(function ($item) {
            $muni = new static();
            $muni->forceFill($item);
            $muni->exists = true;
            return $muni;
        });
    }

    /**
     * Get all static municipalities.
     */
    public static function all($columns = ['*'])
    {
        return self::mapToModels(self::$staticData);
    }

    /**
     * Find a static municipality by ID.
     */
    public static function find($id, $columns = ['*'])
    {
        $item = collect(self::$staticData)->firstWhere('id', $id);
        if (!$item) {
            return null;
        }
        $muni = new static();
        $muni->forceFill($item);
        $muni->exists = true;
        return $muni;
    }

    /**
     * Pluck a column from all static municipalities.
     */
    public static function pluck($column, $key = null)
    {
        return self::all()->pluck($column, $key);
    }

    /**
     * Query wrapper: whereIn filter
     */
    public static function whereIn($column, $values)
    {
        $filtered = self::all()->whereIn($column, $values)->values();
        return new class($filtered) {
            protected $items;
            public function __construct($items) { $this->items = $items; }
            public function get() { return $this->items; }
            public function pluck($column, $key = null) { return $this->items->pluck($column, $key); }
        };
    }

    /**
     * Query wrapper: where filter
     */
    public static function where($column, $operator = null, $value = null)
    {
        if (func_num_args() === 2) {
            $value = $operator;
            $operator = '=';
        }

        $filtered = self::all()->filter(function ($item) use ($column, $value) {
            return $item->$column == $value;
        })->values();

        return new class($filtered) {
            protected $items;
            public function __construct($items) { $this->items = $items; }
            public function get() { return $this->items; }
            public function first() { return $this->items->first(); }
            public function pluck($column, $key = null) { return $this->items->pluck($column, $key); }
        };
    }
}
