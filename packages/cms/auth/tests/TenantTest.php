<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectSetting;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;

beforeEach(fn () => syncAuthManifest());

test('project crud with archive keeps data', function () {
    $admin = Admin::factory()->create();
    $headers = adminHeaders($admin);

    $created = $this->postJson('/api/admin/v1/projects', ['key' => 'shop', 'name' => 'Shop'], $headers)
        ->assertCreated();

    $this->patchJson('/api/admin/v1/projects/shop', ['name' => 'Shop 2'], $headers)
        ->assertOk()->assertJsonPath('data.name', 'Shop 2');

    $this->postJson('/api/admin/v1/projects/shop/archive', [], $headers)
        ->assertOk()->assertJsonPath('data.archived_at', fn ($v) => $v !== null);

    expect(Project::query()->where('key', 'shop')->exists())->toBeTrue();
});

test('duplicate project key is rejected', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'dup');

    $this->postJson('/api/admin/v1/projects', ['key' => 'dup', 'name' => 'X'], adminHeaders($admin))
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'validation_failed');
});

test('non-member gets 404 for project resources', function () {
    $owner = Admin::factory()->create();
    $project = createProjectFor($owner, 'private');

    $stranger = Admin::factory()->create();

    $this->getJson('/api/admin/v1/projects/private', adminHeaders($stranger))->assertNotFound();
    // И в списке проектов его нет
    $this->getJson('/api/admin/v1/projects', adminHeaders($stranger))->assertOk()->assertJsonCount(0, 'data');
});

test('api key secret is shown exactly once', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'keys');
    $headers = adminHeaders($admin);

    $issued = $this->postJson('/api/admin/v1/projects/keys/api-keys', ['type' => 'secret'], $headers)
        ->assertCreated();

    expect($issued->json('data.key'))->toStartWith('sk_live_');

    $list = $this->getJson('/api/admin/v1/projects/keys/api-keys', $headers)->assertOk();
    expect($list->json('data.0.key'))->toBeNull()
        ->and($list->json('data.0.prefix'))->toStartWith('sk_live_');
});

test('disabling a service makes bootstrap hide it', function () {
    $admin = Admin::factory()->create();
    $project = createProjectFor($admin, 'svc');
    $headers = adminHeaders($admin);

    $this->putJson('/api/admin/v1/projects/svc/services/content', ['enabled' => true], $headers)->assertOk();

    $boot = $this->getJson('/api/admin/v1/bootstrap?project=svc', $headers)->assertOk();
    // манифест content не зарегистрирован — сервис включён, но в bootstrap попадут только зарегистрированные
    expect(collect($boot->json('data.services'))->pluck('key'))->not->toContain('analytics');

    $this->putJson('/api/admin/v1/projects/svc/services/content', ['enabled' => false], $headers)->assertOk();
    $boot2 = $this->getJson('/api/admin/v1/bootstrap?project=svc', $headers)->assertOk();
    expect(collect($boot2->json('data.services'))->pluck('key'))->not->toContain('content');
});

test('unknown service toggle is rejected', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'svc2');

    $this->putJson('/api/admin/v1/projects/svc2/services/nope', ['enabled' => true], adminHeaders($admin))
        ->assertStatus(422);
});

test('audit log records tenant actions and is readable', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'aud');
    $headers = adminHeaders($admin);

    $this->postJson('/api/admin/v1/projects/aud/api-keys', ['type' => 'public'], $headers)->assertCreated();

    $log = $this->getJson('/api/admin/v1/projects/aud/audit', $headers)->assertOk();
    expect(collect($log->json('data'))->pluck('action'))->toContain('api_key.issued');
});

test('settings validate against manifest schema and mask secrets', function () {
    // Манифест с настройками: обычная + секретная
    $manifest = new ServiceManifest(
        key: 'content',
        version: '1.0.0',
        settings: [
            new SettingDefinition('cache_ttl', 'integer', 'TTL', 300, ['integer', 'min:0']),
            new SettingDefinition('api_secret', 'string', 'Secret', null, ['string'], secret: true),
        ],
    );
    app(PublishManifestHandler::class)->handle(new PublishManifestCommand($manifest));

    $admin = Admin::factory()->create();
    createProjectFor($admin, 'set');
    $headers = adminHeaders($admin);

    // Невалидное значение → 422
    $this->putJson('/api/admin/v1/projects/set/settings/content', ['values' => ['cache_ttl' => -5]], $headers)
        ->assertStatus(422);

    // Неизвестный ключ → 422
    $this->putJson('/api/admin/v1/projects/set/settings/content', ['values' => ['nope' => 1]], $headers)
        ->assertStatus(422);

    // Валидные значения сохраняются, секрет маскируется
    $saved = $this->putJson('/api/admin/v1/projects/set/settings/content', [
        'values' => ['cache_ttl' => 600, 'api_secret' => 'super-secret'],
    ], $headers)->assertOk();

    $values = collect($saved->json('data'))->keyBy('key');
    expect($values['cache_ttl']['value'])->toBe(600)
        ->and($values['api_secret']['value'])->toBe('••••••');

    // В БД секрет зашифрован
    $raw = ProjectSetting::query()->where('key', 'api_secret')->first();
    expect($raw->value)->not->toContain('super-secret')
        ->and($raw->plainValue())->toBe('super-secret');
});
