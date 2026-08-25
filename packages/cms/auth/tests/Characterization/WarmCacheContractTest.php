<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Illuminate\Support\Facades\Cache;

/**
 * Задача 0.13, инвариант И12: форма закэшированного значения меняется только
 * вместе с ключом.
 *
 * Ключ `bootstrap:{admin}:{project|-}:{version}` переживает деплой: после выката
 * в Redis лежат значения, записанные ПРЕДЫДУЩЕЙ версией кода. Тест кладёт под
 * текущий ключ значение в текущем формате (7-ключевой массив из
 * `BuildBootstrap::build()`) и требует, чтобы эндпоинт отдал именно его.
 *
 * Тест краснеет, если форму значения под этим ключом изменят, не сменив префикс
 * ключа (`bootstrap:` → `bootstrap:s2:`, задача 6.3): прогретый Redis отдаст
 * новому коду старый массив, и панель молча переключит оператора на первый проект.
 */
beforeEach(function () {
    syncAuthManifest();
});

/**
 * Bootstrap-значение ровно в том формате, в каком его сегодня пишет в кэш
 * `BuildBootstrap::build()` (packages/cms/auth/src/Application/Queries/BuildBootstrap.php:85-101).
 * Значения — маркерные: они заведомо расходятся с тем, что дала бы сборка из БД,
 * поэтому совпадение доказывает чтение кэша, а не пересборку.
 */
function warmBootstrapValue(int $adminId, string $projectId, string $marker): array
{
    return [
        'user' => [
            'id' => $adminId,
            'name' => $marker.' Operator',
            'email' => 'cached@example.com',
            'locale' => 'ru',
            'is_super_admin' => false,
        ],
        'projects' => [
            [
                'id' => $projectId,
                'key' => 'site-a',
                'name' => $marker.' SITE A',
                'locales' => ['ru', 'en'],
            ],
        ],
        'current_project' => 'site-a',
        'services' => [
            [
                'key' => 'auth',
                'version' => '0.0.1',
                'enabled' => true,
                'navigation' => [],
                'settings_schema' => [],
            ],
        ],
        'permissions' => ['auth.projects.view'],
        'translations_version' => '7',
        'server_time' => '2024-01-01T00:00:00+00:00',
    ];
}

test('guard: 0.13 bootstrap serves warm cache value in current format', function () {
    $admin = Admin::factory()->create([
        'email' => 'op@example.com',
        'name' => 'Db Operator',
        'locale' => 'en',
    ]);
    $project = createProjectFor($admin, 'site-a');

    // Ключ читается после создания проекта: CreateProjectHandler делает BootstrapCache::bump().
    $projectKey = BootstrapCache::key($admin->id, 'site-a');
    $nullKey = BootstrapCache::key($admin->id, null);

    // Формат ключа фиксируется явно: bootstrap:{admin}:{project|-}:{version}
    expect($projectKey)->toMatch('/^bootstrap:'.$admin->id.':site-a:\d+$/')
        ->and($nullKey)->toMatch('/^bootstrap:'.$admin->id.':-:\d+$/');

    $warmForProject = warmBootstrapValue($admin->id, $project->id, 'CACHED');
    $warmForDefault = warmBootstrapValue($admin->id, $project->id, 'DEFAULTKEY');

    Cache::put($projectKey, $warmForProject, 300);
    Cache::put($nullKey, $warmForDefault, 300);

    // 1. Запрос с явным проектом читает ключ bootstrap:{admin}:site-a:{version}
    $response = $this->getJson('/api/admin/v1/bootstrap?project=site-a', adminHeaders($admin));

    $response->assertOk();

    expect($response->json('data.current_project'))->toBe('site-a')
        // Маркеры: из БД такие значения не собрались бы (там имя 'Db Operator', локаль 'en')
        ->and($response->json('data.user.name'))->toBe('CACHED Operator')
        ->and($response->json('data.user.locale'))->toBe('ru')
        ->and($response->json('data.projects.0.name'))->toBe('CACHED SITE A')
        ->and($response->json('data.translations_version'))->toBe('7')
        ->and($response->json('data.server_time'))->toBe('2024-01-01T00:00:00+00:00');

    $response->assertExactJson(['data' => $warmForProject]);

    // 2. Запрос без параметра project читает ключ с плейсхолдером '-'
    $default = $this->getJson('/api/admin/v1/bootstrap', adminHeaders($admin));

    $default->assertOk();

    expect($default->json('data.current_project'))->toBe('site-a')
        ->and($default->json('data.user.name'))->toBe('DEFAULTKEY Operator');

    $default->assertExactJson(['data' => $warmForDefault]);
});
