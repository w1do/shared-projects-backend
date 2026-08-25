<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\DB;

/**
 * Характеризационные снимки контракта личного кабинета оператора:
 * logout, PATCH /me, восстановление пароля и троттлинг входа.
 */
beforeEach(function () {
    syncAuthManifest();
});

test('contract: admin logout', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);

    $response = $this->postJson('/api/admin/v1/auth/logout', [], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-logout');
});

test('contract: admin logout unauthenticated', function () {
    $response = $this->postJson('/api/admin/v1/auth/logout');

    ResponseSnapshot::assertMatches($response, 'admin-logout-401');
});

test('contract: admin profile update', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Operator',
        'locale' => 'ru',
        'password' => 'secret-123',
    ]);

    $response = $this->patchJson('/api/admin/v1/me', [
        'name' => 'Renamed Operator',
        'locale' => 'en',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-profile-update');
});

test('contract: admin profile update with password', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Operator',
        'locale' => 'ru',
        'password' => 'secret-123',
    ]);

    $response = $this->patchJson('/api/admin/v1/me', [
        'password' => 'new-secret-9',
        'current_password' => 'secret-123',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-profile-update-password');
});

test('contract: admin profile update wrong current password', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Operator',
        'password' => 'secret-123',
    ]);

    $response = $this->patchJson('/api/admin/v1/me', [
        'password' => 'new-secret-9',
        'current_password' => 'not-the-password',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-profile-update-wrong-current-password');
});

test('contract: admin profile update validation error', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);

    $response = $this->patchJson('/api/admin/v1/me', [
        'name' => str_repeat('n', 256),
        'locale' => 'ru-RU-extra-long',
        'password' => 'short',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'admin-profile-update-422');
});

test('contract: admin profile update unauthenticated', function () {
    $response = $this->patchJson('/api/admin/v1/me', ['name' => 'Nobody']);

    ResponseSnapshot::assertMatches($response, 'admin-profile-update-401');
});

test('contract: admin forgot password', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);

    $response = $this->postJson('/api/admin/v1/auth/forgot-password', ['email' => 'op@example.com']);

    ResponseSnapshot::assertMatches($response, 'admin-forgot-password');
});

test('contract: admin forgot password for unknown email', function () {
    $response = $this->postJson('/api/admin/v1/auth/forgot-password', ['email' => 'ghost@example.com']);

    ResponseSnapshot::assertMatches($response, 'admin-forgot-password-unknown');
});

test('contract: admin forgot password validation error', function () {
    $response = $this->postJson('/api/admin/v1/auth/forgot-password', ['email' => 'not-an-email']);

    ResponseSnapshot::assertMatches($response, 'admin-forgot-password-422');
});

test('contract: admin forgot password throttled', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);

    foreach (range(1, 3) as $ignored) {
        $this->postJson('/api/admin/v1/auth/forgot-password', ['email' => 'op@example.com']);
    }

    $response = $this->postJson('/api/admin/v1/auth/forgot-password', ['email' => 'op@example.com']);

    ResponseSnapshot::assertMatches($response, 'admin-forgot-password-429');
});

test('contract: admin reset password', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator', 'password' => 'secret-123']);

    DB::table('password_reset_tokens')->insert([
        'email' => 'op@example.com',
        'guard' => 'admin',
        'project_id' => null,
        'token' => hash('sha256', 'admin-reset-1'),
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/admin/v1/auth/reset-password', [
        'email' => 'op@example.com',
        'token' => 'admin-reset-1',
        'password' => 'new-secret-9',
    ]);

    ResponseSnapshot::assertMatches($response, 'admin-reset-password');
});

test('contract: admin reset password with invalid token', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator', 'password' => 'secret-123']);

    $response = $this->postJson('/api/admin/v1/auth/reset-password', [
        'email' => 'op@example.com',
        'token' => 'nonexistent-token',
        'password' => 'new-secret-9',
    ]);

    ResponseSnapshot::assertMatches($response, 'admin-reset-password-invalid-token');
    // Снимок маскирует значения ключа token — текст сообщения фиксируем явно.
    $response->assertJsonPath('error.details.token.0', 'Reset token is invalid or expired.');
});

test('contract: admin reset password validation error', function () {
    $response = $this->postJson('/api/admin/v1/auth/reset-password', [
        'email' => 'not-an-email',
        'password' => 'short',
    ]);

    ResponseSnapshot::assertMatches($response, 'admin-reset-password-422');
    $response->assertJsonPath('error.details.token.0', 'The token field is required.');
});

test('contract: admin login throttled', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator', 'password' => 'secret-123']);

    foreach (range(1, 5) as $ignored) {
        $this->postJson('/api/admin/v1/auth/login', [
            'email' => 'op@example.com',
            'password' => 'wrong-password',
        ]);
    }

    $response = $this->postJson('/api/admin/v1/auth/login', [
        'email' => 'op@example.com',
        'password' => 'secret-123',
    ]);

    ResponseSnapshot::assertMatches($response, 'admin-login-429');
});
