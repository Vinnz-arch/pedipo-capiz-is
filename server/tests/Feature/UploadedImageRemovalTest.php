<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\LandingPageSetting;
use App\Models\Msme;
use App\Models\NewsArticle;
use App\Models\User;
use App\Support\PublicMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadedImageRemovalTest extends TestCase
{
    use RefreshDatabase;

    private const ONE_BY_ONE_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    private function actingAsStaff(): User
    {
        $staff = User::create([
            'fullname' => 'Maria Staff',
            'username' => 'mariastaff',
            'email' => 'staff@pedipo.com',
            'password' => 'password123',
            'role' => UserRole::STAFF->value,
        ]);

        Sanctum::actingAs($staff);

        return $staff;
    }

    private function fakePng(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent(
            $name,
            base64_decode(self::ONE_BY_ONE_PNG_BASE64)
        );
    }

    public function test_msme_can_be_created_without_images_and_existing_images_can_be_removed(): void
    {
        $this->actingAsStaff();
        $category = Category::create(['name' => 'Retail']);

        $basePayload = [
            'business_name' => 'Capiz Crafts',
            'owner_name' => 'Ana Cruz',
            'category_id' => $category->id,
            'enterprise_type' => 'Micro',
            'municipality_id' => 1,
            'barangay' => 'Barangay I',
            'complete_address' => 'Roxas City',
            'contact_number' => '09171234567',
            'business_description' => 'Local handicrafts',
            'date_registered' => '2026-01-15',
            'status' => 'Active',
        ];

        $logoPath = null;
        $coverPath = null;
        $prodPath1 = null;

        try {
            $createResponse = $this->post('/api/v1/msmes', array_merge($basePayload, [
                'logo' => $this->fakePng('logo.png'),
                'cover' => $this->fakePng('cover.png'),
                'product_image_1' => $this->fakePng('prod1.png'),
            ]));

            $createResponse->assertCreated();
            $msmeId = $createResponse->json('msme.id');
            $logoPath = $createResponse->json('msme.logo_path');
            $coverPath = $createResponse->json('msme.cover_path');
            $prodPath1 = $createResponse->json('msme.product_image_1');

            $this->assertNotNull($logoPath);
            $this->assertNotNull($coverPath);
            $this->assertNotNull($prodPath1);
            $this->assertFileExists(public_path(ltrim($logoPath, '/')));
            $this->assertFileExists(public_path(ltrim($coverPath, '/')));
            $this->assertFileExists(public_path(ltrim($prodPath1, '/')));

            $updateResponse = $this->post("/api/v1/msmes/{$msmeId}", array_merge($basePayload, [
                'remove_logo' => '1',
                'remove_cover' => '1',
                'remove_product_image_1' => '1',
            ]));

            $updateResponse->assertOk();
            $msme = Msme::findOrFail($msmeId);
            $this->assertNull($msme->logo_path);
            $this->assertNull($msme->cover_path);
            $this->assertNull($msme->product_image_1);
            $this->assertFileDoesNotExist(public_path(ltrim($logoPath, '/')));
            $this->assertFileDoesNotExist(public_path(ltrim($coverPath, '/')));
            $this->assertFileDoesNotExist(public_path(ltrim($prodPath1, '/')));
        } finally {
            PublicMedia::deleteIfLocal($logoPath);
            PublicMedia::deleteIfLocal($coverPath);
            PublicMedia::deleteIfLocal($prodPath1);
        }
    }

    public function test_news_article_image_can_be_cleared_on_update(): void
    {
        $this->actingAsStaff();

        $imagePath = null;
        try {
            $createResponse = $this->post('/api/v1/news', [
                'title' => 'Capiz Summit',
                'summary' => 'Short summary',
                'content' => 'Full story content',
                'status' => 'Published',
                'image' => $this->fakePng('news.png'),
            ]);

            $createResponse->assertCreated();
            $articleId = $createResponse->json('article.id');
            $imagePath = $createResponse->json('article.image_path');

            $this->assertNotNull($imagePath);
            $this->assertFileExists(public_path(ltrim($imagePath, '/')));

            $updateResponse = $this->post("/api/v1/news/{$articleId}", [
                'title' => 'Capiz Summit Updated',
                'summary' => 'Short summary',
                'content' => 'Full story content',
                'status' => 'Published',
                'remove_image' => '1',
            ]);

            $updateResponse->assertOk();
            $article = NewsArticle::findOrFail($articleId);
            $this->assertNull($article->image_path);
            $this->assertFileDoesNotExist(public_path(ltrim($imagePath, '/')));
        } finally {
            PublicMedia::deleteIfLocal($imagePath);
        }
    }

    public function test_landing_page_cms_images_can_be_removed_on_update(): void
    {
        $this->actingAsStaff();

        $settingsPayload = [
            'hero_badge' => 'Capiz Registry',
            'hero_title' => 'Invest in Capiz',
            'hero_subtitle' => 'Subtitle',
            'hero_description' => 'Description',
            'vision_text' => 'Vision',
            'mission_point_1' => 'M1',
            'mission_point_2' => 'M2',
            'mission_point_3' => 'M3',
            'msme_title' => 'MSMEs',
            'msme_description' => 'MSME desc',
            'mandate_text' => 'Mandate',
            'service_pledge_1' => 'P1',
            'service_pledge_2' => 'P2',
            'service_pledge_3' => 'P3',
            'service_pledge_4' => 'P4',
            'contact_address' => 'Roxas City',
            'contact_email' => 'info@capiz.gov.ph',
            'contact_phone' => '123456',
            'division_1_title' => 'D1',
            'division_1_subtitle' => 'S1',
            'division_1_bullets' => 'B1',
            'division_2_title' => 'D2',
            'division_2_subtitle' => 'S2',
            'division_2_bullets' => 'B2',
            'division_3_title' => 'D3',
            'division_3_subtitle' => 'S3',
            'division_3_bullets' => 'B3',
        ];

        $heroPath = null;
        $msmePath = null;
        $mandatePath = null;

        try {
            $uploadResponse = $this->post('/api/v1/landing-settings', array_merge($settingsPayload, [
                'hero_image' => $this->fakePng('hero.png'),
                'msme_image' => $this->fakePng('msme.png'),
                'mandate_image' => $this->fakePng('mandate.png'),
            ]));

            $uploadResponse->assertOk();
            $heroPath = $uploadResponse->json('settings.hero_image_path');
            $msmePath = $uploadResponse->json('settings.msme_image_path');
            $mandatePath = $uploadResponse->json('settings.mandate_image_path');

            $this->assertFileExists(public_path(ltrim($heroPath, '/')));
            $this->assertFileExists(public_path(ltrim($msmePath, '/')));
            $this->assertFileExists(public_path(ltrim($mandatePath, '/')));

            $clearResponse = $this->post('/api/v1/landing-settings', array_merge($settingsPayload, [
                'remove_hero_image' => '1',
                'remove_msme_image' => '1',
                'remove_mandate_image' => '1',
            ]));

            $clearResponse->assertOk();
            $settings = LandingPageSetting::firstOrFail();
            $this->assertNull($settings->hero_image_path);
            $this->assertNull($settings->msme_image_path);
            $this->assertNull($settings->mandate_image_path);
            $this->assertFileDoesNotExist(public_path(ltrim($heroPath, '/')));
            $this->assertFileDoesNotExist(public_path(ltrim($msmePath, '/')));
            $this->assertFileDoesNotExist(public_path(ltrim($mandatePath, '/')));
        } finally {
            PublicMedia::deleteIfLocal($heroPath);
            PublicMedia::deleteIfLocal($msmePath);
            PublicMedia::deleteIfLocal($mandatePath);
        }
    }
}

