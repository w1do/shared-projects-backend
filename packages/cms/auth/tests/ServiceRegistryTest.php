<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\Domain\Enums\ServiceName;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;

beforeEach(fn () => syncAuthManifest());

/** @return object{up: callable} миграция бэкфилла licensing */
function licensingBackfillMigration(): object
{
    return require dirname(__DIR__).'/database/migrations/2026_08_28_000000_backfill_licensing_project_service.php';
}

test('licensing is registered as a toggleable service', function () {
    expect(ServiceName::toggleable())->toContain('licensing')
        ->and(config('cms-auth.services'))->toContain('licensing');
});

test('licensing toggle is accepted by the services API', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'lic');
    $headers = adminHeaders($admin);

    $this->putJson('/api/admin/v1/projects/lic/services/licensing', ['enabled' => false], $headers)
        ->assertOk()
        ->assertJsonPath('data.service', 'licensing')
        ->assertJsonPath('data.enabled', false);

    $this->putJson('/api/admin/v1/projects/lic/services/licensing', ['enabled' => true], $headers)
        ->assertOk()
        ->assertJsonPath('data.enabled', true);
});

test('new project has licensing enabled by default and other services disabled', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'fresh');

    $statuses = collect($this->getJson('/api/admin/v1/projects/fresh/services', adminHeaders($admin))
        ->assertOk()
        ->json('data'))->keyBy('service');

    expect($statuses['licensing']['enabled'])->toBeTrue()
        ->and($statuses['content']['enabled'])->toBeFalse()
        ->and($statuses['analytics']['enabled'])->toBeFalse()
        ->and($statuses['pay']['enabled'])->toBeFalse();
});

test('backfill migration enables licensing idempotently and keeps explicit disable', function () {
    // Проект «до релиза» — без строки licensing вовсе.
    $legacy = Project::factory()->create(['key' => 'legacy']);

    // Проект с явным выключением — миграция не должна его трогать.
    $opted = Project::factory()->create(['key' => 'opted-out']);
    ProjectService::create(['project_id' => $opted->id, 'service' => 'licensing', 'enabled' => false]);

    licensingBackfillMigration()->up();

    expect($legacy->fresh()->enabledServices())->toContain('licensing')
        ->and($opted->fresh()->enabledServices())->not->toContain('licensing');

    // Повторный прогон ничего не меняет.
    $count = ProjectService::query()->count();
    licensingBackfillMigration()->up();

    expect(ProjectService::query()->count())->toBe($count)
        ->and($opted->fresh()->enabledServices())->not->toContain('licensing');
});

test('bootstrap returns licensing navigation only while the service is enabled', function () {
    // Права pay.licensing.* объявляет PayManifest — без него право не попадает
    // в каталог и nav-пункт отфильтровывается даже у owner ('*').
    app(PublishManifestHandler::class)->handle(new PublishManifestCommand(new ServiceManifest(
        key: 'pay',
        version: '0.1.0',
        permissions: [new PermissionDefinition('pay.licensing.view', 'Просмотр лицензирования', 'licensing')],
    )));

    // Зеркало LicensingManifest::build() (пакет licensing в auth-service не установлен):
    // ключ licensing, nav-право с префиксом pay. — проверка риска Д2 из design.
    app(PublishManifestHandler::class)->handle(new PublishManifestCommand(new ServiceManifest(
        key: 'licensing',
        version: '0.1.0',
        navigation: [new NavigationItem('licensing', 'nav.licensing', '/licensing', 'pay.licensing.view', 'key-round', 63)],
    )));

    $admin = Admin::factory()->create();
    createProjectFor($admin, 'boot');
    $headers = adminHeaders($admin);

    // licensing включён по умолчанию — bootstrap отдаёт сервис с навигацией
    $services = collect($this->getJson('/api/admin/v1/bootstrap?project=boot', $headers)->assertOk()->json('data.services'));
    $licensing = $services->firstWhere('key', 'licensing');
    expect($licensing)->not->toBeNull()
        ->and(collect($licensing['navigation'])->pluck('key'))->toContain('licensing');

    $this->putJson('/api/admin/v1/projects/boot/services/licensing', ['enabled' => false], $headers)->assertOk();

    $after = collect($this->getJson('/api/admin/v1/bootstrap?project=boot', $headers)->assertOk()->json('data.services'));
    expect($after->pluck('key'))->not->toContain('licensing');
});

test('explicit disable of licensing persists and is not re-enabled automatically', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'off');
    $headers = adminHeaders($admin);

    $this->putJson('/api/admin/v1/projects/off/services/licensing', ['enabled' => false], $headers)->assertOk();

    // Бэкфилл-миграция (повторный деплой) выключение не перезаписывает.
    licensingBackfillMigration()->up();

    $statuses = collect($this->getJson('/api/admin/v1/projects/off/services', $headers)->assertOk()->json('data'))
        ->keyBy('service');

    expect($statuses['licensing']['enabled'])->toBeFalse();
});
