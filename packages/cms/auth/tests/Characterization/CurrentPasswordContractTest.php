<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Hash;

/**
 * Задача 0.5 — характеризация правила `current_password` при смене пароля.
 *
 * Правило живёт НЕ в `rules()`, а в атрибуте `#[RequiredWith('password')]`
 * (`UpdateProfileDTO:17`, `SiteUpdateProfileDTO:16`). Источник 422 различается
 * по тексту сообщения, поэтому он зафиксирован дословно:
 *   - атрибут  → "The current password field is required when password is present."
 *   - handler  → "Current password is incorrect."
 *     (`UpdateAdminProfileHandler:21`, `UpdateSiteProfileHandler:20`)
 * Перенос только `rules()` уронит первый текст в второй, а не даст красный статус —
 * поэтому ассертится именно литерал сообщения, а не просто наличие ключа.
 */
beforeEach(function () {
    syncAuthManifest();
});

/** Проект сайта с публичным API-ключом (локальный хелпер задачи 0.5). */
function guard05SiteProject(): array
{
    $admin = Admin::factory()->create(['email' => 'owner@example.com', 'name' => 'Owner']);
    $project = createProjectFor($admin, 'site-guard05');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    return ['project' => $project, 'headers' => ['X-Api-Key' => $issued['plain']]];
}

/** Регистрирует пользователя сайта и возвращает заголовки ключ + токен. */
function guard05SiteUserHeaders(array $site, string $email, string $password): array
{
    $token = test()->postJson('/api/v1/auth/register', [
        'email' => $email,
        'password' => $password,
        'name' => 'Site User',
    ], $site['headers'])->json('data.token');

    return $site['headers'] + ['Authorization' => "Bearer {$token}"];
}

/** (a) Смена пароля оператора без `current_password` — отбивается ДО handler'а. */
test('guard: 0.5 admin password change without current_password returns 422', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Operator',
        'locale' => 'ru',
        'password' => 'secret-123',
    ]);

    $response = $this->patchJson('/api/admin/v1/me', [
        'password' => 'new-secret-1',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'guard-05-admin-profile-password-without-current');

    $response->assertStatus(422);
    $response->assertJsonPath('error.code', 'validation_failed');
    // Источник 422 — атрибут #[RequiredWith('password')], а не handler:
    // текст handler'а — "Current password is incorrect.".
    $response->assertJsonPath(
        'error.details.current_password.0',
        'The current password field is required when password is present.',
    );

    $stored = Admin::query()->where('email', 'op@example.com')->firstOrFail();
    expect(Hash::check('secret-123', $stored->password))->toBeTrue();
    expect(Hash::check('new-secret-1', $stored->password))->toBeFalse();
});

/** Контрольный кейс: неверный `current_password` — 422 уже из handler'а, другой текст. */
test('guard: 0.5 admin password change with wrong current_password returns 422 from handler', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Operator',
        'locale' => 'ru',
        'password' => 'secret-123',
    ]);

    $response = $this->patchJson('/api/admin/v1/me', [
        'password' => 'new-secret-1',
        'current_password' => 'not-the-password',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'guard-05-admin-profile-wrong-current-password');

    $response->assertStatus(422);
    $response->assertJsonPath('error.details.current_password.0', 'Current password is incorrect.');

    $stored = Admin::query()->where('email', 'op@example.com')->firstOrFail();
    expect(Hash::check('secret-123', $stored->password))->toBeTrue();
});

/** (b) Смена пароля оператора с верным `current_password` — успех и вход новым паролем. */
test('guard: 0.5 admin password change with current_password succeeds and new password logs in', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Operator',
        'locale' => 'ru',
        'password' => 'secret-123',
    ]);

    $response = $this->patchJson('/api/admin/v1/me', [
        'password' => 'new-secret-1',
        'current_password' => 'secret-123',
    ], adminHeaders($admin));

    ResponseSnapshot::assertMatches($response, 'guard-05-admin-profile-password-changed');
    $response->assertStatus(200);

    $stored = Admin::query()->where('email', 'op@example.com')->firstOrFail();
    expect(Hash::check('new-secret-1', $stored->password))->toBeTrue();
    expect(Hash::check('secret-123', $stored->password))->toBeFalse();

    $login = $this->postJson('/api/admin/v1/auth/login', [
        'email' => 'op@example.com',
        'password' => 'new-secret-1',
    ]);

    ResponseSnapshot::assertMatches($login, 'guard-05-admin-login-with-new-password');
    $login->assertStatus(200);
    $login->assertJsonPath('data.admin.email', 'op@example.com');
    expect($login->json('data.token'))->toBeString()->not->toBe('');

    // Старый пароль больше не подходит.
    $this->postJson('/api/admin/v1/auth/login', [
        'email' => 'op@example.com',
        'password' => 'secret-123',
    ])->assertStatus(422)->assertJsonPath('error.details.email.0', 'Invalid credentials.');
});

/** (c) Смена пароля пользователя сайта без `current_password` — отбивается ДО handler'а. */
test('guard: 0.5 site password change without current_password returns 422', function () {
    $site = guard05SiteProject();
    $headers = guard05SiteUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', [
        'password' => 'new-secret-1',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'guard-05-site-profile-password-without-current');

    $response->assertStatus(422);
    $response->assertJsonPath('error.code', 'validation_failed');
    $response->assertJsonPath(
        'error.details.current_password.0',
        'The current password field is required when password is present.',
    );

    $stored = User::acrossProjects()->where('email', 'u@example.com')->firstOrFail();
    expect(Hash::check('secret-123', $stored->password))->toBeTrue();
    expect(Hash::check('new-secret-1', $stored->password))->toBeFalse();
});

/** Контрольный кейс сайта: неверный `current_password` — 422 из handler'а, другой текст. */
test('guard: 0.5 site password change with wrong current_password returns 422 from handler', function () {
    $site = guard05SiteProject();
    $headers = guard05SiteUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', [
        'password' => 'new-secret-1',
        'current_password' => 'not-the-password',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'guard-05-site-profile-wrong-current-password');

    $response->assertStatus(422);
    $response->assertJsonPath('error.details.current_password.0', 'Current password is incorrect.');

    $stored = User::acrossProjects()->where('email', 'u@example.com')->firstOrFail();
    expect(Hash::check('secret-123', $stored->password))->toBeTrue();
});

/** (d) Смена пароля пользователя сайта с верным `current_password` — успех и вход новым паролем. */
test('guard: 0.5 site password change with current_password succeeds and new password logs in', function () {
    $site = guard05SiteProject();
    $headers = guard05SiteUserHeaders($site, 'u@example.com', 'secret-123');

    $response = $this->patchJson('/api/v1/auth/me', [
        'password' => 'new-secret-1',
        'current_password' => 'secret-123',
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'guard-05-site-profile-password-changed');
    $response->assertStatus(200);

    $stored = User::acrossProjects()->where('email', 'u@example.com')->firstOrFail();
    expect(Hash::check('new-secret-1', $stored->password))->toBeTrue();
    expect(Hash::check('secret-123', $stored->password))->toBeFalse();

    $login = $this->postJson('/api/v1/auth/login', [
        'email' => 'u@example.com',
        'password' => 'new-secret-1',
    ], $site['headers']);

    ResponseSnapshot::assertMatches($login, 'guard-05-site-login-with-new-password');
    $login->assertStatus(200);
    $login->assertJsonPath('data.user.email', 'u@example.com');
    expect($login->json('data.token'))->toBeString()->not->toBe('');

    // Старый пароль больше не подходит.
    $this->postJson('/api/v1/auth/login', [
        'email' => 'u@example.com',
        'password' => 'secret-123',
    ], $site['headers'])->assertStatus(422)->assertJsonPath('error.details.email.0', 'Invalid credentials.');
});
