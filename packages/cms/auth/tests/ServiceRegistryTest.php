<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\Domain\Enums\ActorType;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Enums\ServiceName;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\AuditLog;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;

beforeEach(fn () => syncAuthManifest());

/** @return object{up: callable} миграция включения pay проектам с лицензированием */
function payForLicensingMigration(): object
{
    return require dirname(__DIR__).'/database/migrations/2026_08_30_000000_enable_pay_for_licensing_projects.php';
}

test('licensing is not a toggleable service', function () {
    expect(ServiceName::toggleable())->not->toContain('licensing')
        ->and(config('cms-auth.services'))->not->toContain('licensing')
        ->and(ServiceName::Licensing->gate())->toBe(ServiceName::Pay);
});

test('licensing toggle is rejected by the services API', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'lic');

    $this->putJson('/api/admin/v1/projects/lic/services/licensing', ['enabled' => true], adminHeaders($admin))
        ->assertStatus(422);
});

test('services API lists the three toggleable services, all disabled for a new project', function () {
    $admin = Admin::factory()->create();
    createProjectFor($admin, 'fresh');

    $statuses = collect($this->getJson('/api/admin/v1/projects/fresh/services', adminHeaders($admin))
        ->assertOk()
        ->json('data'))->keyBy('service');

    expect($statuses->keys()->all())->toEqualCanonicalizing(['content', 'analytics', 'pay'])
        ->and($statuses['content']['enabled'])->toBeFalse()
        ->and($statuses['analytics']['enabled'])->toBeFalse()
        ->and($statuses['pay']['enabled'])->toBeFalse();
});

/** След включения сервиса оператором: бэкфилл такой записи не оставляет. */
function auditServiceEnabled(string $projectId, string $service): void
{
    AuditLog::create([
        'project_id' => $projectId,
        'actor_type' => ActorType::Admin->value,
        'actor_id' => '1',
        'action' => AuditAction::ServiceEnabled->value,
        'subject' => "service:{$service}",
        'created_at' => now(),
    ]);
}

test('migration enables pay only where an operator enabled licensing', function () {
    // Лицензирование включил оператор, оплата выключена — разделы пропали бы без миграции.
    $enabledByOperator = Project::factory()->create(['key' => 'lic-on']);
    ProjectService::create(['project_id' => $enabledByOperator->id, 'service' => 'licensing', 'enabled' => true]);
    ProjectService::create(['project_id' => $enabledByOperator->id, 'service' => 'pay', 'enabled' => false]);
    auditServiceEnabled($enabledByOperator->id, 'licensing');

    // Лицензирование проставил бэкфилл: следа оператора нет — оплату не включаем.
    $backfilled = Project::factory()->create(['key' => 'lic-backfill']);
    ProjectService::create(['project_id' => $backfilled->id, 'service' => 'licensing', 'enabled' => true]);

    // Лицензирование выключено явно — оплату включать не за что.
    $optedOut = Project::factory()->create(['key' => 'lic-off']);
    ProjectService::create(['project_id' => $optedOut->id, 'service' => 'licensing', 'enabled' => false]);
    auditServiceEnabled($optedOut->id, 'licensing');

    payForLicensingMigration()->up();

    expect($enabledByOperator->fresh()->enabledServices())->toContain('pay')
        ->and($backfilled->fresh()->enabledServices())->not->toContain('pay')
        ->and($optedOut->fresh()->enabledServices())->not->toContain('pay');

    // Строки licensing остаются на месте, повторный прогон ничего не добавляет.
    $count = ProjectService::query()->count();
    payForLicensingMigration()->up();

    expect(ProjectService::query()->count())->toBe($count)
        ->and(ProjectService::query()->where('service', 'licensing')->count())->toBe(3);
});

test('bootstrap returns licensing navigation only while pay is enabled', function () {
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
        navigation: [new NavigationItem('licenses', 'nav.licenses', '/licensing/licenses', 'pay.licensing.view', 'key-round', 64)],
    )));

    $admin = Admin::factory()->create();
    createProjectFor($admin, 'boot');
    $headers = adminHeaders($admin);

    // pay выключен — навигации лицензирования в bootstrap нет
    $before = collect($this->getJson('/api/admin/v1/bootstrap?project=boot', $headers)->assertOk()->json('data.services'));
    expect($before->pluck('key'))->not->toContain('licensing');

    $this->putJson('/api/admin/v1/projects/boot/services/pay', ['enabled' => true], $headers)->assertOk();

    $services = collect($this->getJson('/api/admin/v1/bootstrap?project=boot', $headers)->assertOk()->json('data.services'));
    $licensing = $services->firstWhere('key', 'licensing');
    expect($licensing)->not->toBeNull()
        ->and(collect($licensing['navigation'])->pluck('key'))->toContain('licenses');

    $this->putJson('/api/admin/v1/projects/boot/services/pay', ['enabled' => false], $headers)->assertOk();

    $after = collect($this->getJson('/api/admin/v1/bootstrap?project=boot', $headers)->assertOk()->json('data.services'));
    expect($after->pluck('key'))->not->toContain('licensing');
});
