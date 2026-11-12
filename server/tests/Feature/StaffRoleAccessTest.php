<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Inquiry;
use App\Models\NewsArticle;
use App\Models\User;
use App\Models\UserLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.recaptcha.secret' => 'test-secret']);
        Http::fake([
            'https://www.google.com/recaptcha/api/siteverify' => Http::response(['success' => true], 200),
        ]);
    }

    public function test_admin_and_pedipo_staff_can_login_and_portal_user_cannot_login_at_management_endpoint(): void
    {
        $admin = Admin::create([
            'name' => 'Administrator',
            'email' => 'admin@pedipo.com',
            'password' => Hash::make('password123'),
        ]);

        $staff = User::create([
            'fullname' => 'Maria Staff',
            'username' => 'mariastaff',
            'email' => 'staff@pedipo.com',
            'password' => 'password123',
            'role' => UserRole::STAFF->value,
        ]);

        $portalUser = User::create([
            'fullname' => 'Juan Investor',
            'username' => 'juaninvestor',
            'email' => 'client@pedipo.com',
            'password' => 'password123',
            'role' => UserRole::USER->value,
        ]);

        // Admin login
        $adminLogin = $this->postJson('/api/v1/login', [
            'email' => $admin->email,
            'password' => 'password123',
            'recaptcha_token' => 'test-token',
        ]);
        $adminLogin->assertOk()
            ->assertJsonPath('user.role', 'admin');

        // Staff login at management endpoint
        $staffLogin = $this->postJson('/api/v1/login', [
            'email' => $staff->email,
            'password' => 'password123',
            'recaptcha_token' => 'test-token',
        ]);
        $staffLogin->assertOk()
            ->assertJsonPath('user.role', 'staff')
            ->assertJsonPath('user.name', 'Maria Staff');

        $this->assertDatabaseHas('user_logs', [
            'user_id' => $staff->id,
            'action' => 'login',
        ]);

        // Staff logout logs activity
        $staffToken = $staffLogin->json('access_token');
        $this->withToken($staffToken)
            ->postJson('/api/v1/logout')
            ->assertOk();

        $this->assertDatabaseHas('user_logs', [
            'user_id' => $staff->id,
            'action' => 'logout',
        ]);

        // Staff cannot log in via portal login endpoint
        $this->postJson('/api/v1/user/login', [
            'email' => $staff->email,
            'password' => 'password123',
            'recaptcha_token' => 'test-token',
        ])->assertStatus(422);

        // Portal user cannot log in via management login endpoint
        $this->postJson('/api/v1/login', [
            'email' => $portalUser->email,
            'password' => 'password123',
            'recaptcha_token' => 'test-token',
        ])->assertStatus(422);
    }

    public function test_pedipo_staff_can_access_allowed_modules_only(): void
    {
        $staff = User::create([
            'fullname' => 'PEDIPO Staff',
            'username' => 'pedipostaff',
            'email' => 'staff@pedipo.com',
            'password' => 'password123',
            'role' => UserRole::STAFF->value,
        ]);

        $portalUser = User::create([
            'fullname' => 'Portal User',
            'username' => 'portaluser',
            'email' => 'portal@pedipo.com',
            'password' => 'password123',
            'role' => UserRole::USER->value,
        ]);

        $inquiry = Inquiry::create([
            'user_id' => $portalUser->id,
            'investor_name' => 'Investor One',
            'email' => 'portal@pedipo.com',
            'subject' => 'Land Lease',
            'purpose' => 'Investment Inquiry',
            'message' => 'Interested in Capiz.',
            'status' => 'Pending',
        ]);

        $category = Category::create([
            'name' => 'Agri-Business',
            'slug' => 'agri-business',
        ]);

        NewsArticle::create([
            'title' => 'Draft Announcement',
            'slug' => 'draft-announcement-1',
            'summary' => 'Draft summary',
            'content' => 'Draft content',
            'status' => 'Draft',
        ]);

        Sanctum::actingAs($staff);

        // Allowed: Dashboard, Landing Page CMS & News, MSMEs, Data Entry, Investments
        $this->getJson('/api/v1/admin/dashboard')->assertOk();

        $this->getJson('/api/v1/news')
            ->assertOk()
            ->assertJsonCount(1, 'articles');

        $this->postJson('/api/v1/news', [
            'title' => 'Staff News Update',
            'summary' => 'Summary',
            'content' => 'Body content',
            'status' => 'Published',
        ])->assertCreated();

        $this->getJson('/api/v1/msmes')->assertOk();
        $this->postJson('/api/v1/msmes', [
            'business_name' => 'Capiz Seafood Co',
            'owner_name' => 'Pedro Santos',
            'category_id' => $category->id,
            'enterprise_type' => 'Small',
            'municipality_id' => 1,
            'barangay' => 'Baybay',
            'complete_address' => 'Roxas City, Capiz',
            'contact_number' => '09171234567',
            'business_description' => 'Processed seafood products',
            'date_registered' => '2026-01-15',
        ])->assertCreated();

        $this->postJson('/api/v1/parent-opportunities', [
            'name' => 'Capiz Agro-Industrial Zone',
            'category_id' => $category->id,
            'status' => 'Draft',
        ])->assertCreated();

        $this->postJson('/api/v1/opportunities', [
            'project_name' => 'Cold Storage Facility',
            'category_id' => $category->id,
            'status' => 'Draft',
        ])->assertCreated();

        // Validation check (not 403) proves Data Entry and Landing Page CMS are reachable by staff
        $this->postJson('/api/v1/admin/manual-upload', [])->assertStatus(422);
        $this->putJson('/api/v1/landing-settings', [])->assertStatus(422);

        // Forbidden: Users, User Logs, Inquiries, MSME Assistance Requests, Notifications
        $this->getJson('/api/v1/users')->assertForbidden();
        $this->postJson('/api/v1/users', [])->assertForbidden();
        $this->getJson("/api/v1/users/{$portalUser->id}/logs")->assertForbidden();
        $this->getJson('/api/v1/inquiries')->assertForbidden();
        $this->getJson("/api/v1/inquiries/{$inquiry->id}")->assertForbidden();
        $this->putJson("/api/v1/inquiries/{$inquiry->id}", ['status' => 'Approved'])->assertForbidden();
        $this->deleteJson("/api/v1/inquiries/{$inquiry->id}")->assertForbidden();
        $this->getJson('/api/v1/msme-requests')->assertForbidden();
        $this->getJson('/api/v1/notifications')->assertForbidden();
    }

    public function test_portal_user_is_blocked_from_management_routes_and_admin_can_create_staff(): void
    {
        $admin = Admin::create([
            'name' => 'Administrator',
            'email' => 'admin@pedipo.com',
            'password' => Hash::make('password123'),
        ]);

        $portalUser = User::create([
            'fullname' => 'Portal User',
            'username' => 'portaluser',
            'email' => 'portal@pedipo.com',
            'password' => 'password123',
            'role' => UserRole::USER->value,
        ]);

        NewsArticle::create([
            'title' => 'Internal Draft',
            'slug' => 'internal-draft-1',
            'summary' => 'Hidden draft',
            'content' => 'Hidden content',
            'status' => 'Draft',
        ]);

        // Portal user cannot access admin/staff endpoints
        Sanctum::actingAs($portalUser);

        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->postJson('/api/v1/admin/manual-upload', [])->assertForbidden();
        $this->getJson('/api/v1/users')->assertForbidden();
        $this->getJson('/api/v1/msmes')->assertForbidden();
        $this->postJson('/api/v1/parent-opportunities', [])->assertForbidden();
        $this->postJson('/api/v1/opportunities', [])->assertForbidden();
        $this->putJson('/api/v1/landing-settings', [])->assertForbidden();
        $this->postJson('/api/v1/news', [])->assertForbidden();

        // Portal user retains own portal endpoints and does not see Draft news
        $this->getJson('/api/v1/inquiries')->assertOk();
        $this->getJson('/api/v1/msme-requests')->assertOk();
        $this->getJson('/api/v1/notifications')->assertOk();
        $this->getJson('/api/v1/news')->assertOk()->assertJsonCount(0, 'articles');

        // Admin can create a PEDIPO Staff account but cannot assign 'admin' role on users table
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/users', [
            'fullname' => 'New Staff',
            'username' => 'newstaff',
            'email' => 'newstaff@pedipo.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'role' => UserRole::STAFF->value,
        ])->assertCreated()->assertJsonPath('user.role', 'staff');

        $this->postJson('/api/v1/users', [
            'fullname' => 'Fake Admin',
            'username' => 'fakeadmin',
            'email' => 'fakeadmin@pedipo.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'role' => UserRole::ADMIN->value,
        ])->assertStatus(422);
    }
}
