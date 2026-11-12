<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Opportunity;
use App\Models\ParentOpportunity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OpportunityImageTest extends TestCase
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

    public function test_creating_child_project_without_image_stores_null_image_path(): void
    {
        $this->actingAsStaff();
        $category = Category::create(['name' => 'Information Tech']);
        $parent = ParentOpportunity::create([
            'name' => 'IT Park Hub',
            'category_id' => $category->id,
            'status' => 'Published',
        ]);

        $response = $this->postJson("/api/v1/parent-opportunities/{$parent->id}/projects", [
            'project_name' => 'Roxas No-Image Project',
            'category_id' => $category->id,
            'municipality_id' => 1,
            'status' => 'Published',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('project.image_path', null);

        $this->assertDatabaseHas('opportunities', [
            'project_name' => 'Roxas No-Image Project',
            'image_path' => null,
        ]);
    }

    public function test_creating_standalone_opportunity_without_image_stores_null_image_path(): void
    {
        $this->actingAsStaff();
        $category = Category::create(['name' => 'Agriculture']);

        $response = $this->postJson('/api/v1/opportunities', [
            'project_name' => 'Standalone No-Image Project',
            'category_id' => $category->id,
            'municipality_id' => 1,
            'status' => 'Draft',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('opportunity.image_path', null);

        $this->assertDatabaseHas('opportunities', [
            'project_name' => 'Standalone No-Image Project',
            'image_path' => null,
        ]);
    }

    public function test_updating_child_project_with_remove_image_clears_stored_image(): void
    {
        Storage::fake('public');
        $this->actingAsStaff();

        $category = Category::create(['name' => 'Tourism/Hospitality']);
        $parent = ParentOpportunity::create([
            'name' => 'Coastal Tourism',
            'category_id' => $category->id,
            'status' => 'Published',
        ]);

        $file = UploadedFile::fake()->createWithContent(
            'project.png',
            base64_decode(self::ONE_BY_ONE_PNG_BASE64)
        );

        $createResponse = $this->post("/api/v1/parent-opportunities/{$parent->id}/projects", [
            'project_name' => 'Coastal Resort',
            'category_id' => $category->id,
            'municipality_id' => 1,
            'status' => 'Published',
            'image' => $file,
        ]);

        $createResponse->assertCreated();
        $createdPath = $createResponse->json('project.image_path');
        $this->assertNotNull($createdPath);
        $this->assertStringStartsWith('/storage/opportunities/', $createdPath);

        $relativePath = substr($createdPath, strlen('/storage/'));
        Storage::disk('public')->assertExists($relativePath);

        $projectId = $createResponse->json('project.id');

        $updateResponse = $this->post("/api/v1/child-projects/{$projectId}", [
            '_method' => 'PUT',
            'project_name' => 'Coastal Resort',
            'remove_image' => '1',
        ]);

        $updateResponse->assertOk();
        $updateResponse->assertJsonPath('project.image_path', null);

        $project = Opportunity::findOrFail($projectId);
        $this->assertNull($project->image_path);
        Storage::disk('public')->assertMissing($relativePath);
    }
}

