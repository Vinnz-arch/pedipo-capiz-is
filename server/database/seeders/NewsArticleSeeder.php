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
        // Article 1: Filamerian IT students
        $title1 = 'Filamerian IT students join World Youth Skills Camp';
        NewsArticle::updateOrCreate(
            ['title' => $title1],
            [
                'slug' => Str::slug($title1),
                'summary' => 'IT Students from Filamer Christian University participated in the prestigious World Youth Skills Camp, representing local talent and showcasing advanced robotics and systems designs.',
                'content' => "The IT Department of Filamer Christian University (FCU) recently represented the institution in the World Youth Skills Camp. The event brought together student innovators and tech leaders from across the region to collaborate, build, and test next-generation robotics.\n\nUnder the guidance of their mentors, the Filamerian IT students engaged in rigorous workshops focusing on artificial intelligence, hardware assembly, and remote data-logging systems.\n\n\"Participating in this skills camp allowed us to apply our programming knowledge in a real-world setting, and collaborate with other talented students,\" one of the delegates noted. \"We got to build a mobile solar-powered monitoring crawler from scratch, which was a huge highlight.\"\n\nPEDIPO Capiz commends Filamer Christian University for driving innovation and supporting Capizeno youth in developing industry-critical tech skills.",
                'image_path' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                'author' => 'FCU Media & PEDIPO Team',
                'status' => 'Published',
                'published_at' => now(),
                'source_name' => 'Filamer Christian University Press',
                'source_url' => 'https://filamer.edu.ph',
            ]
        );

        // Article 2: Capiz Economic Forum
        $title2 = 'Capiz Economic Forum Highlights Sustainable Investments';
        NewsArticle::updateOrCreate(
            ['title' => $title2],
            [
                'slug' => Str::slug($title2),
                'summary' => 'The annual Capiz Economic Forum brought together government officials, investors, and local businesses to discuss sustainable business practices and green energy incentives.',
                'content' => "This year's Capiz Economic Forum gathered key industry leaders, local government executives, and foreign investors at the Capiz Government and Business Center. The focus centered around introducing new local tax incentives for eco-friendly operations, recycling initiatives, and green technology adoption.\n\n\"Capiz is positioning itself as a hub for sustainable growth in Western Visayas,\" said a PEDIPO representative. \"We want to make sure that our development partners not only profit but also preserve our rich natural resources.\"",
                'image_path' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                'author' => 'PEDIPO Communications',
                'status' => 'Published',
                'published_at' => now()->subDays(2),
                'source_name' => 'PEDIPO Capiz Official',
                'source_url' => 'https://capiz.gov.ph',
            ]
        );

        // Article 3: Roxas City Seafood Processing
        $title3 = 'Roxas City Seafood Exporters Eye European Markets';
        NewsArticle::updateOrCreate(
            ['title' => $title3],
            [
                'slug' => Str::slug($title3),
                'summary' => 'Local seafood processing companies are upgrading facilities to meet stringent European Union sanitary standards, eyeing potential expansion into EU export markets.',
                'content' => "With Roxas City renowned as the Seafood Capital of the Philippines, exporters are preparing for major regulatory updates. Collaborative training sessions organized by PEDIPO and the Department of Trade and Industry (DTI) are guiding local processing hubs through advanced food preservation and global shipping certifications.\n\nBy securing EU clearance, the local economy stands to gain substantial jobs in processing, sorting, and packaging.",
                'image_path' => 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
                'author' => 'Industry News Desk',
                'status' => 'Published',
                'published_at' => now()->subDays(5),
                'source_name' => 'DTI Region VI News',
                'source_url' => 'https://www.dti.gov.ph',
            ]
        );
    }
}
