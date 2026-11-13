<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewsArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Article 1: PEDIPO Recognized for Excellence in Investment Promotion
        $title1 = 'Provincial Economic Development and Investment Promotions Office recognized for Excellence in Investment Promotion';
        NewsArticle::updateOrCreate(
            ['title' => $title1],
            [
                'slug' => Str::slug($title1),
                'summary' => 'The Provincial Economic Development and Investment Promotions Office (PEDIPO), under the leadership of Mr. Rio C. Garcia, received a special citation for excellence in investment promotion from EcoSolar Energy Corporation during the mechanical completion ceremony of the 20MW / 40MWh Panitan Energy Storage Project in Panitan, Capiz.',
                'content' => "The Provincial Economic Development and Investment Promotions Office (PEDIPO), under the leadership of Local Economic Development and Investment Promotions Officer, Mr. Rio C. Garcia, received a special citation for excellence in investment promotion from the EcoSolar Energy Corporation (ESEC) during the mechanical completion ceremony of its 20MW / 40MWh Panitan Energy Storage Project (PESP), held last July 23, 2026 at Brgy. Timpas, Panitan, Capiz.\n\nThe recognition highlights PEDIPO's efforts in fostering an investor-friendly environment, specifically for strengthening collaboration among the concerned government agencies, local stakeholders, and project proponents. Mr. Francisco G. Delfin, Jr., President of EcoSolar Energy Corporation, also thanked PEDIPO for extending its unwavering support and invaluable assistance to ESEC in obtaining the various documentary requirements. Mr. Rio C. Garcia, PEDIPO Head, received the said recognition in the presence of Capiz Provincial Governor, Fredenil H. Castro, who has also been instrumental in successful development of the said project.\n\nThe PESP is the first ever energy storage facility in the Province, and is part of the bigger 90MW Panitan Solar Project. Together, the battery storage and solar developments marks the first private-sector power generation investment in Capiz in 17 years.",
                'image_path' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
                'author' => 'PEDIPO Communications',
                'status' => 'Published',
                'published_at' => now(),
                'source_name' => 'EcoSolar Energy Corporation / PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Article 2: Mechanical Completion Ceremony of the Panitan Energy Storage Project
        $title2 = 'Mechanical Completion Ceremony of the Panitan Energy Storage Project';
        NewsArticle::updateOrCreate(
            ['title' => $title2],
            [
                'slug' => Str::slug($title2),
                'summary' => 'EcoSolar Energy Corporation marked the mechanical completion of its 20MW / 40MWh Panitan Energy Storage Project (PESP) in Brgy. Timpas, Panitan, Capiz—the first energy storage facility in the province and the first private-sector power generation investment in Capiz in 17 years.',
                'content' => "The mechanical completion ceremony of the 20MW / 40MWh Panitan Energy Storage Project (PESP) was officially held on July 23, 2026 at Brgy. Timpas, Panitan, Capiz, marking a monumental milestone for the province's renewable energy sector.\n\nDeveloped by EcoSolar Energy Corporation (ESEC), the PESP represents the first ever energy storage facility in the Province of Capiz and serves as a critical component of the larger 90MW Panitan Solar Project. Together, the battery energy storage system (BESS) and solar power developments mark the first private-sector power generation investment in Capiz in 17 years.\n\nThe ceremony was attended by Capiz Provincial Governor Fredenil H. Castro, Local Economic Development and Investment Promotions Officer Mr. Rio C. Garcia, and Mr. Francisco G. Delfin, Jr., President of EcoSolar Energy Corporation, along with key local stakeholders and regional energy officials.\n\nThe state-of-the-art facility will reinforce grid stability in the Visayas, capture excess solar generation, and provide dispatchable clean energy to power households and industries across the Panay sub-grid.",
                'image_path' => 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
                'author' => 'PEDIPO Communications',
                'status' => 'Published',
                'published_at' => now()->subDays(1),
                'source_name' => 'EcoSolar Energy Corporation / PEDIPO Capiz',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Article 3: Invest in Capiz - Priority Sectors and Local Tax Incentives Package
        $title3 = 'Invest in Capiz: Province Highlights Key Investment Sectors and Local Tax Incentives Package';
        NewsArticle::updateOrCreate(
            ['title' => $title3],
            [
                'slug' => Str::slug($title3),
                'summary' => 'Strategically located at the heart of Western Visayas and recognized as the Seafood Capital of the Philippines, Capiz unveils its key investment priority areas—Aquaculture & Fisheries, Renewable Energy, Tourism, and IT-BPM in Pueblo de Panay—backed by 5-year local tax incentives up to 100%.',
                'content' => "The Provincial Government of Capiz, through the Provincial Economic Development and Investment Promotions Office (PEDIPO), has rolled out an intensive investment promotion campaign highlighting the province's strategic advantages, key priority sectors, and competitive local fiscal incentives.\n\nStrategically located at the heart of Western Visayas and proudly recognized as the Seafood Capital of the Philippines, Capiz offers far more than its thriving fisheries and aquaculture industry. Blessed with diverse ecosystems and abundant natural resources, the province is home to pristine beaches, breathtaking landscapes, energy-rich rivers, and vast agricultural lands—creating a strong foundation for sustainable economic growth and investment.\n\nThese natural and strategic advantages position Capiz as a premier investment destination for high-growth industries:\n• Aquaculture & Fisheries: Spanning mud crab breeding, oyster concessions in Sapian Bay, coastal mariculture cages, and cold storage hubs.\n• Renewable Energy: Harnessing solar, mini-hydro, and biomass power to support the green energy transition.\n• Tourism - Inland/Island Resort Development: Developing coastal MICE hotels, natural adventure parks, and cultural heritage destinations.\n• Information Technology & Business Process Management (IT-BPM): Anchored by 7 hectares in Pueblo de Panay Township dedicated to IT-BPM developments.\n• Agro-Industrial & Qualified Manufacturing: Encompassing food processing, feed milling, and high-value crop production.\n\nUnder the Capiz Province Investment and Incentives Code, registered investors in priority areas enjoy graduated local tax exemptions:\n• 1st Year: 100% Exemption\n• 2nd Year: 100% Exemption\n• 3rd Year: 100% Exemption\n• 4th Year: 50% Exemption\n• 5th Year: 25% Exemption\n\nThe PEDIPO Investment Services Division provides end-to-end investor facilitation, including local tax incentives evaluation, locational assistance, investor briefings, and inter-agency coordination at its office located at the 2nd Floor, Capiz Government and Business Center, Brgy. Tiza, Roxas City.",
                'image_path' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                'author' => 'PEDIPO Investment Services Division',
                'status' => 'Published',
                'published_at' => now()->subDays(2),
                'source_name' => 'Capiz Provincial Government / PEDIPO',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Article 4: Capiz Economic Forum
        $title4 = 'Capiz Economic Forum Highlights Sustainable Investments';
        NewsArticle::updateOrCreate(
            ['title' => $title4],
            [
                'slug' => Str::slug($title4),
                'summary' => 'The annual Capiz Economic Forum brought together government officials, investors, and local businesses to discuss sustainable business practices and green energy incentives.',
                'content' => "This year's Capiz Economic Forum gathered key industry leaders, local government executives, and foreign investors at the Capiz Government and Business Center. The focus centered around introducing new local tax incentives for eco-friendly operations, recycling initiatives, and green technology adoption.\n\n\"Capiz is positioning itself as a hub for sustainable growth in Western Visayas,\" said a PEDIPO representative. \"We want to make sure that our development partners not only profit but also preserve our rich natural resources.\"",
                'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                'author' => 'PEDIPO Communications',
                'status' => 'Published',
                'published_at' => now()->subDays(4),
                'source_name' => 'PEDIPO Capiz Official',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Article 5: Roxas City Seafood Processing
        $title5 = 'Roxas City Seafood Exporters Eye European Markets';
        NewsArticle::updateOrCreate(
            ['title' => $title5],
            [
                'slug' => Str::slug($title5),
                'summary' => 'Local seafood processing companies are upgrading facilities to meet stringent European Union sanitary standards, eyeing potential expansion into EU export markets.',
                'content' => "With Roxas City renowned as the Seafood Capital of the Philippines, exporters are preparing for major regulatory updates. Collaborative training sessions organized by PEDIPO and the Department of Trade and Industry (DTI) are guiding local processing hubs through advanced food preservation and global shipping certifications.\n\nBy securing EU clearance, the local economy stands to gain substantial jobs in processing, sorting, and packaging.",
                'image_path' => 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
                'author' => 'Industry News Desk',
                'status' => 'Published',
                'published_at' => now()->subDays(7),
                'source_name' => 'DTI Region VI News',
                'source_url' => 'https://www.dti.gov.ph',
            ]
        );
    }
}
