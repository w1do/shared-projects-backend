<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\User;

test('web token is rejected on admin routes', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin);

    $user = User::factory()->create(['project_id' => $project->id]);
    $webToken = $user->createToken('web')->plainTextToken;

    $this->getJson('/api/admin/v1/me', ['Authorization' => "Bearer {$webToken}"])
        ->assertStatus(401);
});

test('admin token is rejected on site auth routes', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin);
    $key = ProjectApiKey::issue($project->id, 'public', ['collect']);
    $adminToken = $admin->createToken('admin')->plainTextToken;

    $this->getJson('/api/v1/auth/me', [
        'Authorization' => "Bearer {$adminToken}",
        'X-Api-Key' => $key['plain'],
    ])->assertStatus(401);
});

test('same email can exist in two projects independently', function () {
    $admin = Admin::factory()->create();
    $a = createProjectFor($admin, 'site-a');
    $b = createProjectFor($admin, 'site-b');

    $ua = User::factory()->create(['project_id' => $a->id, 'email' => 'same@example.com']);
    $ub = User::factory()->create(['project_id' => $b->id, 'email' => 'same@example.com']);

    expect($ua->id)->not->toBe($ub->id)
        ->and(User::acrossProjects()->where('email', 'same@example.com')->count())->toBe(2);
});
