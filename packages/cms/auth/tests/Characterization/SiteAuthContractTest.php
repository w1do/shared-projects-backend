<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\DB;

/**
 * Характеризационные снимки публичного контракта /api/v1/auth/*:
 * проект резолвится из API-ключа сайта, токен действует только в нём.
 */
beforeEach(function () {
    syncAuthManifest();
});

/** Проект сайта с публичным API-ключом. */
function siteContractProject(string $key = 'site-a'): array
{
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    $project = createProjectFor($admin, $key);
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    return ['project' => $project, 'headers' => ['X-Api-Key' => $issued['plain']]];
}

/** Регистрирует пользователя сайта и возвращает заголовки с его токеном. */
function siteContractUserHeaders(array $site, string $email, string $password): array
{
    $token = test()->postJson('/api/v1/auth/register', [
        'email' => $email,
        'password' => $password,
        'name' => 'Site User',
    ], $site['headers'])->json('data.token');

    return $site['headers'] + ['Authorization' => "Bearer {$token}"];
}

test('contract: site register', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/register', [
        'email' => 'u@example.com',
        'password' => 'secret-123',
        'name' => 'Site User',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-register');
});

test('contract: site register validation error', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/register', [
        'email' => 'not-an-email',
        'password' => 'short',
        'name' => str_repeat('n', 256),
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-register-422');
});

test('contract: site register with taken email', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->postJson('/api/v1/auth/register', [
        'email' => 'u@example.com',
        'password' => 'other-456-7',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-register-taken-422');
});

test('contract: site register without api key', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'email' => 'u@example.com',
        'password' => 'secret-123',
    ]);

    ResponseSnapshot::assertMatches($response, 'site-register-401');
});

test('contract: site register with revoked api key', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'name' => 'Operator']);
    /** @var Project $project */
    $project = createProjectFor($admin, 'site-a');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);
    $issued['model']->forceFill(['revoked_at' => now()])->save();

    $response = $this->postJson('/api/v1/auth/register', [
        'email' => 'u@example.com',
        'password' => 'secret-123',
    ], ['X-Api-Key' => $issued['plain']]);

    ResponseSnapshot::assertMatches($response, 'site-register-revoked-key-401');
});

test('contract: site login', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'u@example.com',
        'password' => 'secret-123',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-login');
});

test('contract: site login with wrong password', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'u@example.com',
        'password' => 'wrong-password',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-login-wrong-password');
});

test('contract: site login validation error', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/login', ['email' => 'not-an-email'], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-login-422');
});

test('contract: site login throttled', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    foreach (range(1, 5) as $ignored) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'u@example.com',
            'password' => 'wrong-password',
        ], $site['headers']);
    }

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'u@example.com',
        'password' => 'secret-123',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-login-429');
});

test('contract: site me', function () {
    $site = siteContractProject();
    $headers = siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->getJson('/api/v1/auth/me', $headers);

    ResponseSnapshot::assertMatches($response, 'site-me');
});

test('contract: site me unauthenticated', function () {
    $site = siteContractProject();

    $response = $this->getJson('/api/v1/auth/me', $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-me-401');
});

test('contract: site profile update', function () {
    $site = siteContractProject();
    $headers = siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', ['name' => 'Renamed User'], $headers);

    ResponseSnapshot::assertMatches($response, 'site-profile-update');
});

test('contract: site profile update with password', function () {
    $site = siteContractProject();
    $headers = siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', [
        'password' => 'new-secret-9',
        'current_password' => 'secret-123',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'site-profile-update-password');
});

test('contract: site profile update wrong current password', function () {
    $site = siteContractProject();
    $headers = siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', [
        'password' => 'new-secret-9',
        'current_password' => 'not-the-password',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'site-profile-update-wrong-current-password');
});

test('contract: site profile update validation error', function () {
    $site = siteContractProject();
    $headers = siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', [
        'name' => str_repeat('n', 256),
        'password' => 'short',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'site-profile-update-422');
});

test('contract: site profile update unauthenticated', function () {
    $site = siteContractProject();

    $response = $this->patchJson('/api/v1/auth/me', ['name' => 'Nobody'], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-profile-update-401');
});

test('contract: site logout', function () {
    $site = siteContractProject();
    $headers = siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->postJson('/api/v1/auth/logout', [], $headers);

    ResponseSnapshot::assertMatches($response, 'site-logout');
});

test('contract: site logout unauthenticated', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/logout', [], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-logout-401');
});

test('contract: site forgot password', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'u@example.com',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-forgot-password');
});

test('contract: site forgot password for unknown email', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'ghost@example.com',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-forgot-password-unknown');
});

test('contract: site forgot password validation error', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'not-an-email'], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-forgot-password-422');
});

test('contract: site forgot password throttled', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    foreach (range(1, 3) as $ignored) {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'u@example.com'], $site['headers']);
    }

    $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'u@example.com'], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-forgot-password-429');
});

test('contract: site reset password', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    DB::table('password_reset_tokens')->insert([
        'email' => 'u@example.com',
        'guard' => 'web',
        'project_id' => $site['project']->id,
        'token' => hash('sha256', 'site-reset-1'),
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'u@example.com',
        'token' => 'site-reset-1',
        'password' => 'new-secret-9',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-reset-password');
});

test('contract: site reset password with invalid token', function () {
    $site = siteContractProject();
    siteContractUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'u@example.com',
        'token' => 'nonexistent-token',
        'password' => 'new-secret-9',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-reset-password-invalid-token');
    // Снимок маскирует значения ключа token — текст сообщения фиксируем явно.
    $response->assertJsonPath('error.details.token.0', 'Reset token is invalid or expired.');
});

test('contract: site reset password validation error', function () {
    $site = siteContractProject();

    $response = $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'not-an-email',
        'password' => 'short',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($response, 'site-reset-password-422');
    $response->assertJsonPath('error.details.token.0', 'The token field is required.');
});
