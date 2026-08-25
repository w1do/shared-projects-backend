<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;

/**
 * Задача 6.6: проверки «роль объявлена в этом проекте» и «оператор уже участник»
 * переехали из handler в `InviteMemberRequest`. Тесты фиксируют код, ключ и текст
 * ошибки — то, что при переносе теряется молча.
 */
beforeEach(function () {
    syncAuthManifest();
});

test('invite with a role of another project is rejected', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'invite-a');

    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
        'email' => 'new@example.com',
        'role' => 'no-such-role',
    ], adminHeaders($owner));

    $response->assertStatus(422)
        ->assertJsonPath('error.details.role.0', 'Unknown role for this project.');

    // Аккаунт-сирота не заведён: роль проверяется до создания оператора
    expect(Admin::query()->where('email', 'new@example.com')->exists())->toBeFalse();
});

test('inviting an existing member twice is rejected', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'invite-b');

    $payload = ['email' => 'member@example.com', 'role' => 'editor'];

    $this->postJson("/api/admin/v1/projects/{$project->key}/members", $payload, adminHeaders($owner))
        ->assertStatus(201);

    $this->postJson("/api/admin/v1/projects/{$project->key}/members", $payload, adminHeaders($owner))
        ->assertStatus(422)
        ->assertJsonPath('error.details.email.0', 'Already a member of this project.');

    expect($project->members()->count())->toBe(2);
});

test('unknown role wins over duplicate membership', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'invite-c');

    // Оператор уже участник и роль неизвестна — сообщается только про роль
    $response = $this->postJson("/api/admin/v1/projects/{$project->key}/members", [
        'email' => $owner->email,
        'role' => 'no-such-role',
    ], adminHeaders($owner));

    $response->assertStatus(422)
        ->assertJsonPath('error.details.role.0', 'Unknown role for this project.')
        ->assertJsonMissingPath('error.details.email');
});
