<?php

namespace Database\Seeders;

use App\Models\LandingPageSetting;
use Illuminate\Database\Seeder;

class LandingPageSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LandingPageSetting::firstOrCreate(
            ['hero_title' => 'Invest in Capiz'],
            [
                'hero_badge' => 'WELCOME TO THE SEAFOOD CAPITAL OF THE PHILIPPINES',
                'hero_subtitle' => 'Experience a business-friendly province where local and foreign investors prosper in partnership with a resilient and sustainable government.',
                'hero_description' => 'Experience a business-friendly province where local and foreign investors prosper in partnership with a resilient and sustainable government.',
                'hero_image_path' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
                
                // Vision & Mission
                'vision_text' => 'The vision of Capiz PEDIPO is to enforce a business-friendly province that creates an environment where local and foreign investors and businesses prosper in partnership with the local government, generating economic and investment opportunities for Capizenos facilitating resilience and sustainable development.',
                'mission_point_1' => 'PEDIPO shall develop programs and policies to enhance the economy, and facilitate assistance to attract prospective investors, retain and support existing businesses for more investments to flow in the Province of Capiz.',
                'mission_point_2' => 'PEDIPO shall also consider economic developments and investment priorities as well as national and international business and trade trends that will impact the Province of Capiz to reinforce more responsive policies and programs.',
                'mission_point_3' => 'PEDIPO shall establish and maintain Public-Private Partnership (PPP) and relationship with other national government regulatory agency to promote the business-private friendliness of the LGU and enhance the facilitation of incentives to PPP projects.',
                
                // MSME
                'msme_title' => 'MSME Empowerment',
                'msme_description' => 'We provide comprehensive support for Micro, Small, and Medium Enterprises. From marketing analysis to financial insights, our mission is to ensure your business thrives in the Capiz ecosystem.',
                'msme_image_path' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
                
                // Mandate & Pledge
                'mandate_text' => 'The Capiz Government and Business Center was established to operate as a self-liquidating enterprise and to serve as an additional source of revenue for the Province, helping stimulate local economic growth.',
                'mandate_image_path' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
                'service_pledge_1' => 'Creating a safe and friendly environment for business transactions.',
                'service_pledge_2' => 'Delivering efficient, respectful, and courteous service to clients and tenants.',
                'service_pledge_3' => 'Promoting the growth of the local community and business sector.',
                'service_pledge_4' => 'Serving senior citizens and differently-abled individuals with care and inclusion.',
                
                // Contact Details
                'contact_address' => '2nd Floor, Room 22, Capiz Government and Business Center, Roxas City',
                'contact_email' => 'capiz.pedipo@gmail.com',
                'contact_phone' => '(036) 620-755',
                'contact_facebook' => 'https://facebook.com/capiz.pedipo',
                'contact_twitter' => 'https://twitter.com/capiz.pedipo',
                'contact_linkedin' => 'https://linkedin.com/company/capiz-pedipo',
                
                // Division 1
                'division_1_title' => 'BUSINESS DEVELOPMENT',
                'division_1_subtitle' => 'SUPPORTING LOCAL GROWTH & ENTERPRISE',
                'division_1_bullets' => "Trade Promotions: Oversee trade & industry exhibitions.\nSME Coordination: Project initiatives with LGUs, councils & agencies.\nProduct Promotion: Highlight local products, visitor's marketplace.\nResearch & Innovation: Study standards and industry trends.\nProduct Matching: Connect MSMEs to market opportunities.",
                
                // Division 2
                'division_2_title' => 'INVESTMENT SERVICES',
                'division_2_subtitle' => 'FACILITATING GLOBAL CAPITAL',
                'division_2_bullets' => "Registration Support: Assisting database creation & assistance.\nPartnerships: Connect with local businesses to secure providers.\nLocal Expertise: Guidance through various provincial offices.\nPriority Financing: Align with city's critical projects.\nDedicated Assistance: Responsive team for all concerns.",
                
                // Division 3
                'division_3_title' => 'ECONOMIC ENTERPRISE',
                'division_3_subtitle' => 'STRATEGIC GOVERNMENT VENTURES',
                'division_3_bullets' => "Enterprise Development: Plan and execute new ventures.\nPPP Center Support: Access resource lists, training & tools.\nProject Implementation: Oversee MSME projects.\nData Management: Maintain LGU PPP records on LGU portal.\nResearch & Policy: Study best practices for expansion.",
            ]
        );
    }
}
