<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;
use Tests\TestCase;

/**
 * Прогон генератора целиком (задачи 8.1/8.4): модуль генерируется во временный
 * каталог ВНЕ репозитория (`--base`), проверяется на соответствие канону
 * CLAUDE.md/STRUCTURE.md и удаляется после теста.
 *
 * Проверки повторяют `packages/cms/shared/tests/ArchitectureGateTest.php` по
 * смыслу, но не переиспользуют его функции: тот гейт сканирует ровно шесть
 * реальных модуль-пакетов, и сгенерированный модуль в него не подмешивается.
 * Имена хелперов здесь свои — тесты пакетов грузятся в один процесс.
 */
uses(TestCase::class);

const MADE_MODULE = 'demo-widget';
const MADE_MODULE_STUDLY = 'DemoWidget';

/** База генерации: свой каталог на процесс, чтобы параллельные прогоны не пересекались. */
function madeModuleBase(): string
{
    return sys_get_temp_dir().'/cms-make-module-'.getmypid();
}

function madeModulePath(): string
{
    return madeModuleBase().'/packages/cms/'.MADE_MODULE;
}

/** Запускает генератор во временную базу и возвращает код выхода. */
function runMakeModule(): int
{
    return Artisan::call('make:module', ['name' => MADE_MODULE, '--base' => madeModuleBase()]);
}

/**
 * php-файлы каталога рекурсивно.
 *
 * @return list<string>
 */
function madeModulePhpFiles(string $dir): array
{
    if (! is_dir($dir)) {
        return [];
    }

    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if ($file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }

    sort($files);

    return $files;
}

/**
 * Строки файлов, совпавшие с шаблоном. Комментарии не считаются нарушением:
 * канон в стабах описывают, а не нарушают.
 *
 * @param  list<string>  $files
 * @return list<string> сообщения «файл — строка»
 */
function madeModuleGrep(array $files, string $pattern): array
{
    $hits = [];
    foreach ($files as $path) {
        foreach (explode("\n", (string) file_get_contents($path)) as $line) {
            $trimmed = ltrim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, '/*')) {
                continue;
            }
            if (preg_match($pattern, $line) === 1) {
                $hits[] = basename($path).' — '.trim($line);
            }
        }
    }

    return $hits;
}

/**
 * Пустые каталоги внутри дерева — та же проверка, что и в архитектурном гейте.
 *
 * @return list<string>
 */
function madeModuleEmptyDirs(string $root): array
{
    $empty = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );
    foreach ($iterator as $entry) {
        if ($entry->isDir() && iterator_count(new FilesystemIterator($entry->getPathname())) === 0) {
            $empty[] = $entry->getPathname();
        }
    }

    return $empty;
}

beforeEach(function () {
    File::deleteDirectory(madeModuleBase());
});

afterEach(function () {
    // Временный модуль не переживает тест.
    File::deleteDirectory(madeModuleBase());
});

test('generator scaffolds the canonical four-layer tree', function () {
    expect(runMakeModule())->toBe(0);

    $module = madeModulePath();

    $expected = [
        'src/Domain/Models', 'src/Domain/Enums', 'src/Domain/ValueObjects',
        'src/Domain/Events', 'src/Domain/Policies', 'src/Domain/Contracts',
        'src/Application/Commands', 'src/Application/Queries', 'src/Application/DTOs/Item', 'src/Application/Handlers',
        'src/Infrastructure/Persistence', 'src/Infrastructure/Providers',
        'src/Infrastructure/Gateways', 'src/Infrastructure/Notifications',
        'src/Presentation/Http/Api/V1/Controllers/Admin', 'src/Presentation/Http/Api/V1/Controllers/Site',
        'src/Presentation/Http/Api/V1/Requests', 'src/Presentation/Http/Api/V1/Resources',
        'config', 'database/migrations', 'database/factories', 'routes', 'tests',
    ];

    $missing = array_values(array_filter($expected, fn (string $dir): bool => ! is_dir("{$module}/{$dir}")));

    expect($missing)->toBe([])
        // Jobs живут в Infrastructure/Persistence — отдельного каталога канон не знает.
        ->and(is_dir("{$module}/src/Infrastructure/Jobs"))->toBeFalse()
        ->and(is_file("{$module}/config/cms-".MADE_MODULE.'.php'))->toBeTrue()
        ->and(is_file(madeModuleBase().'/packages/frontend/'.MADE_MODULE.'/package.json'))->toBeTrue();
});

test('generator emits the full FormRequest to Resource pipeline', function () {
    expect(runMakeModule())->toBe(0);

    $module = madeModulePath();

    $pipeline = [
        'src/Presentation/Http/Api/V1/Controllers/Admin/ItemController.php',
        'src/Presentation/Http/Api/V1/Controllers/Site/ItemController.php',
        'src/Presentation/Http/Api/V1/Requests/Item/UpsertItemRequest.php',
        'src/Presentation/Http/Api/V1/Resources/Item/ItemResource.php',
        'src/Application/DTOs/Item/UpsertItemDTO.php',
        'src/Application/DTOs/Item/ItemDTO.php',
        'src/Application/Commands/UpsertItemCommand.php',
        'src/Application/Handlers/UpsertItemHandler.php',
        'src/Application/Queries/ListItemsQuery.php',
        'src/Domain/Policies/ItemPolicy.php',
        'src/Domain/Contracts/ItemRepository.php',
        'src/Infrastructure/Persistence/EloquentItemRepository.php',
        'tests/ItemTest.php',
        'tests/TestCase.php',
    ];

    $missing = array_values(array_filter($pipeline, fn (string $file): bool => ! is_file("{$module}/{$file}")));

    $controller = (string) file_get_contents("{$module}/src/Presentation/Http/Api/V1/Controllers/Admin/ItemController.php");
    $resource = (string) file_get_contents("{$module}/src/Presentation/Http/Api/V1/Resources/Item/ItemResource.php");

    expect($missing)->toBe([])
        // Контроллер — тонкий: принимает FormRequest, зовёт Handler, отдаёт Resource.
        ->and($controller)->toContain('UpsertItemRequest $request')
        ->and($controller)->toContain('$handler->handle(new UpsertItemCommand(')
        ->and($controller)->toContain('new ItemResource(')
        ->and($resource)->toContain('use Cms\Shared\Http\Resources\ApiResource;')
        ->and($resource)->toContain('extends ApiResource');
});

test('generated php files are syntactically valid', function () {
    expect(runMakeModule())->toBe(0);

    $files = madeModulePhpFiles(madeModulePath());

    expect($files)->not->toBeEmpty();

    $broken = [];
    foreach ($files as $file) {
        $lint = new Process([PHP_BINARY, '-l', $file]);
        $lint->run();

        if (! $lint->isSuccessful()) {
            $broken[] = basename($file).': '.trim($lint->getOutput().$lint->getErrorOutput());
        }
    }

    expect($broken)->toBe([]);
});

test('generated module satisfies the architecture gate rules', function () {
    expect(runMakeModule())->toBe(0);

    $module = madeModulePath();
    $src = "{$module}/src";
    $violations = [];

    // Валидация — только в FormRequest: ни rules() в DTO, ни validate() в коде.
    foreach (madeModuleGrep(madeModulePhpFiles("{$src}/Application/DTOs"), '/function\s+rules\s*\(/') as $hit) {
        $violations[] = "rules() в DTO: {$hit}";
    }
    foreach (madeModuleGrep(madeModulePhpFiles("{$src}/Application/DTOs"), '/use\s+Illuminate\\\\Http\\\\/') as $hit) {
        $violations[] = "DTO → Illuminate\\Http: {$hit}";
    }
    foreach (madeModuleGrep(madeModulePhpFiles($src), '/\$request->validate\(|Validator::make\(/') as $hit) {
        $violations[] = "валидация вне FormRequest: {$hit}";
    }

    // Сервис-локатор в слоях.
    foreach (['Domain', 'Application', 'Presentation'] as $layer) {
        foreach (madeModuleGrep(madeModulePhpFiles("{$src}/{$layer}"), '/\b(?:app|resolve)\(/') as $hit) {
            $violations[] = "сервис-локатор в {$layer}: {$hit}";
        }
    }

    // Суффикс *Query.
    foreach (madeModulePhpFiles("{$src}/Application/Queries") as $path) {
        if (! str_ends_with($path, 'Query.php')) {
            $violations[] = "query без суффикса: {$path}";
        }
    }

    // Провайдер — в Infrastructure/Providers, а не в корне src/.
    foreach (glob("{$src}/*ServiceProvider.php") ?: [] as $path) {
        $violations[] = "провайдер в корне src/: {$path}";
    }
    if ((glob("{$src}/Infrastructure/Providers/*ServiceProvider.php") ?: []) === []) {
        $violations[] = 'нет провайдера в Infrastructure/Providers/';
    }

    // Направление зависимостей.
    foreach (madeModuleGrep(madeModulePhpFiles("{$src}/Domain"), '/use\s+Cms\\\\'.MADE_MODULE_STUDLY.'\\\\Application\\\\/') as $hit) {
        $violations[] = "Domain → Application: {$hit}";
    }
    foreach (madeModuleGrep(madeModulePhpFiles("{$src}/Application"), '/use\s+Illuminate\\\\Http\\\\Request;|use\s+Illuminate\\\\Foundation\\\\Http\\\\FormRequest;/') as $hit) {
        $violations[] = "Application → HTTP: {$hit}";
    }

    // Границы пакетов: чужие модели и Cms\Auth\* (И15) не импортируются.
    foreach (['Auth', 'Content', 'Pay', 'Analytics', 'Localization', 'Ai'] as $other) {
        foreach (madeModuleGrep(madeModulePhpFiles($src), "/use\\s+Cms\\\\{$other}\\\\/") as $hit) {
            $violations[] = "граница пакетов → Cms\\{$other}: {$hit}";
        }
    }

    // Пустых каталогов нет.
    foreach (madeModuleEmptyDirs($src) as $path) {
        $violations[] = "пустой каталог: {$path}";
    }

    expect($violations)->toBe([]);
});

test('generated composer.json wires the canonical provider and cms/contracts', function () {
    expect(runMakeModule())->toBe(0);

    $module = madeModulePath();

    /** @var array{require: array<string, string>, autoload: array{'psr-4': array<string, string>}, extra: array{laravel: array{providers: list<string>}}} $composer */
    $composer = json_decode((string) file_get_contents("{$module}/composer.json"), true, 512, JSON_THROW_ON_ERROR);

    $providerFqcn = 'Cms\\'.MADE_MODULE_STUDLY.'\\Infrastructure\\Providers\\'.MADE_MODULE_STUDLY.'ServiceProvider';

    expect($composer['require'])->toHaveKey('cms/contracts')          // используется <Studly>Manifest
        ->and($composer['require'])->toHaveKey('cms/shared')
        ->and($composer['extra']['laravel']['providers'])->toBe([$providerFqcn])
        ->and($composer['autoload']['psr-4'])->toHaveKey('Cms\\'.MADE_MODULE_STUDLY.'\\')
        // FQCN из composer.json резолвится в реально сгенерированный файл
        ->and(is_file("{$module}/src/Infrastructure/Providers/".MADE_MODULE_STUDLY.'ServiceProvider.php'))->toBeTrue()
        ->and(file_get_contents("{$module}/src/".MADE_MODULE_STUDLY.'Manifest.php'))
        ->toContain('use Cms\Contracts\Manifest\ServiceManifest;');
});

test('generator refuses to overwrite an existing package', function () {
    expect(runMakeModule())->toBe(0)
        ->and(runMakeModule())->toBe(1)
        ->and(Artisan::output())->toContain('already exists');
});
