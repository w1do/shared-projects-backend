<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\BlockUserCommand;
use Cms\Auth\Application\Handlers\BlockUserHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;
use Illuminate\Support\Facades\DB;

function siteKeys(): array
{
    $admin = Admin::factory()->create();
    $a = createProjectFor($admin, 'site-a');
    $b = createProjectFor($admin, 'site-b');

    return [
        'a' => ProjectApiKey::issue($a->id, 'public', ['collect'])['plain'],
        'b' => ProjectApiKey::issue($b->id, 'public', ['collect'])['plain'],
        'projectA' => $a,
        'projectB' => $b,
    ];
}

test('site user registers and logs in through the project api key', function () {
    $keys = siteKeys();

    $this->postJson('/api/v1/auth/register', [
        'email' => 'u@example.com', 'password' => 'secret-123',
    ], ['X-Api-Key' => $keys['a']])
        ->assertCreated()
        ->assertJsonPath('data.user.project_id', $keys['projectA']->id);

    $login = $this->postJson('/api/v1/auth/login', [
        'email' => 'u@example.com', 'password' => 'secret-123',
    ], ['X-Api-Key' => $keys['a']])->assertOk();

    $token = $login->json('data.token');

    $this->getJson('/api/v1/auth/me', ['X-Api-Key' => $keys['a'], 'Authorization' => "Bearer {$token}"])
        ->assertOk()
        ->assertJsonPath('data.email', 'u@example.com');
});

test('same email in another project is an independent account', function () {
    $keys = siteKeys();

    $this->postJson('/api/v1/auth/register', ['email' => 'dup@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']])
        ->assertCreated();

    // В проекте B этот email свободен — регистрация проходит
    $this->postJson('/api/v1/auth/register', ['email' => 'dup@example.com', 'password' => 'other-456'], ['X-Api-Key' => $keys['b']])
        ->assertCreated();

    // Вход в B с паролем от A не работает
    $this->postJson('/api/v1/auth/login', ['email' => 'dup@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['b']])
        ->assertStatus(422);
});

test('token of project A is rejected with the key of project B', function () {
    $keys = siteKeys();

    $this->postJson('/api/v1/auth/register', ['email' => 'x@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']]);
    $token = $this->postJson('/api/v1/auth/login', ['email' => 'x@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']])
        ->json('data.token');

    $this->getJson('/api/v1/auth/me', ['X-Api-Key' => $keys['b'], 'Authorization' => "Bearer {$token}"])
        ->assertStatus(401);
});

test('request without api key is rejected', function () {
    $this->postJson('/api/v1/auth/login', ['email' => 'a@b.c', 'password' => 'x'])
        ->assertStatus(401);
});

test('revoked api key stops working immediately', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'site-r');
    $issued = ProjectApiKey::issue($project->id, 'public', ['collect']);

    $this->postJson('/api/v1/auth/register', ['email' => 'r@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $issued['plain']])
        ->assertCreated();

    $issued['model']->forceFill(['revoked_at' => now()])->save();

    $this->postJson('/api/v1/auth/login', ['email' => 'r@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $issued['plain']])
        ->assertStatus(401);
});

test('site password reset invalidates tokens and is single use', function () {
    $keys = siteKeys();
    $projectId = $keys['projectA']->id;

    $this->postJson('/api/v1/auth/register', ['email' => 's@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']]);
    $token = $this->postJson('/api/v1/auth/login', ['email' => 's@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']])
        ->json('data.token');

    DB::table('password_reset_tokens')->insert([
        'email' => 's@example.com', 'guard' => 'web', 'project_id' => $projectId,
        'token' => hash('sha256', 'site-reset-1'), 'created_at' => now(),
    ]);

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => 's@example.com', 'token' => 'site-reset-1', 'password' => 'new-secret-9',
    ], ['X-Api-Key' => $keys['a']])->assertOk();

    $this->getJson('/api/v1/auth/me', ['X-Api-Key' => $keys['a'], 'Authorization' => "Bearer {$token}"])
        ->assertStatus(401);

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => 's@example.com', 'token' => 'site-reset-1', 'password' => 'zzz-secret',
    ], ['X-Api-Key' => $keys['a']])->assertStatus(422);
});

test('blocked user cannot log in and loses tokens', function () {
    $keys = siteKeys();

    $this->postJson('/api/v1/auth/register', ['email' => 'b@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']]);
    $token = $this->postJson('/api/v1/auth/login', ['email' => 'b@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']])
        ->json('data.token');

    $user = User::acrossProjects()->where('email', 'b@example.com')->firstOrFail();
    app(BlockUserHandler::class)->handle(new BlockUserCommand($user, true));

    $this->getJson('/api/v1/auth/me', ['X-Api-Key' => $keys['a'], 'Authorization' => "Bearer {$token}"])
        ->assertStatus(401);
    $this->postJson('/api/v1/auth/login', ['email' => 'b@example.com', 'password' => 'secret-123'], ['X-Api-Key' => $keys['a']])
        ->assertStatus(422);
});
