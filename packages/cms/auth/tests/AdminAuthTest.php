<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(fn () => RateLimiter::clear('admin-login:op@example.com|127.0.0.1'));

test('operator logs in with valid credentials and gets a bearer token', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'password' => 'secret-123']);

    $response = $this->postJson('/api/admin/v1/auth/login', [
        'email' => 'op@example.com',
        'password' => 'secret-123',
    ])->assertOk();

    $token = $response->json('data.token');

    $this->getJson('/api/admin/v1/me', ['Authorization' => "Bearer {$token}"])
        ->assertOk()
        ->assertJsonPath('data.email', 'op@example.com');
});

test('invalid password returns 422 without leaking account existence', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'password' => 'secret-123']);

    $this->postJson('/api/admin/v1/auth/login', ['email' => 'op@example.com', 'password' => 'wrong'])
        ->assertStatus(422);
    $this->postJson('/api/admin/v1/auth/login', ['email' => 'ghost@example.com', 'password' => 'wrong'])
        ->assertStatus(422);
});

test('login is rate limited with 429', function () {
    Admin::factory()->create(['email' => 'op@example.com', 'password' => 'secret-123']);

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/admin/v1/auth/login', ['email' => 'op@example.com', 'password' => 'wrong']);
    }

    $this->postJson('/api/admin/v1/auth/login', ['email' => 'op@example.com', 'password' => 'secret-123'])
        ->assertStatus(429);
});

test('unauthenticated request to admin api returns 401 envelope', function () {
    $this->getJson('/api/admin/v1/me')
        ->assertStatus(401)
        ->assertJsonPath('error.code', 'unauthenticated');
});

test('password reset token is single-use and invalidates tokens', function () {
    $admin = Admin::factory()->create(['email' => 'op@example.com', 'password' => 'secret-123']);
    $oldToken = $admin->createToken('t')->plainTextToken;

    // Токен создаётся напрямую (доставка письмом вне объёма)
    DB::table('password_reset_tokens')->insert([
        'email' => 'op@example.com', 'guard' => 'admin',
        'token' => hash('sha256', 'reset-token-1'), 'created_at' => now(),
    ]);

    $this->postJson('/api/admin/v1/auth/reset-password', [
        'email' => 'op@example.com', 'token' => 'reset-token-1', 'password' => 'new-secret-1',
    ])->assertOk();

    // Старый bearer инвалидирован
    $this->getJson('/api/admin/v1/me', ['Authorization' => "Bearer {$oldToken}"])->assertStatus(401);

    // Повторное использование токена отклоняется
    $this->postJson('/api/admin/v1/auth/reset-password', [
        'email' => 'op@example.com', 'token' => 'reset-token-1', 'password' => 'another-secret',
    ])->assertStatus(422);

    // Новый пароль работает
    $this->postJson('/api/admin/v1/auth/login', ['email' => 'op@example.com', 'password' => 'new-secret-1'])
        ->assertOk();
});

test('operator updates profile locale', function () {
    $admin = Admin::factory()->create();

    $this->patchJson('/api/admin/v1/me', ['locale' => 'en'], adminHeaders($admin))
        ->assertOk()
        ->assertJsonPath('data.locale', 'en');
});
