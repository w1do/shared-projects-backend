<?php

declare(strict_types=1);

namespace Cms\Generators;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

/**
 * make:module <name> — скаффолд пары пакетов по каноническому four-layer
 * (CLAUDE.md / STRUCTURE.md): backend `packages/cms/<name>` и frontend
 * `packages/frontend/<name>`.
 *
 * Генерируется не пустой каркас, а сквозной пример сущности Item: конвейер
 * FormRequest → DTO → Handler → Resource, порт в Domain/Contracts и его
 * реализация в Infrastructure/Persistence. Переименуйте Item под свою
 * предметную область, лишнее удалите — структура при этом должна остаться.
 */
final class MakeModuleCommand extends Command
{
    protected $signature = 'make:module
        {name : kebab-case имя модуля}
        {--base= : корень монорепозитория (по умолчанию — два уровня над base_path())}';

    protected $description = 'Scaffold a backend + frontend package pair for a new platform module';

    /**
     * Каталоги канона, которые остаются без стаба: заполняются по мере
     * появления внешних адаптеров и уведомлений. Плейсхолдер нужен, чтобы
     * каталог пережил git и не считался «пустым» архитектурным гейтом.
     *
     * @var list<string>
     */
    private const PLACEHOLDER_DIRS = [
        'src/Infrastructure/Gateways',
        'src/Infrastructure/Notifications',
    ];

    /** @var list<string> */
    private const CANONICAL_DIRS = [
        'src/Domain/Models',
        'src/Domain/Enums',
        'src/Domain/ValueObjects',
        'src/Domain/Events',
        'src/Domain/Policies',
        'src/Domain/Contracts',
        'src/Application/Commands',
        'src/Application/Queries',
        'src/Application/DTOs/Item',
        'src/Application/Handlers',
        // Jobs и кэши модуля живут в Persistence — отдельного Infrastructure/Jobs канон не знает.
        'src/Infrastructure/Persistence',
        'src/Infrastructure/Providers',
        'src/Infrastructure/Gateways',
        'src/Infrastructure/Notifications',
        'src/Presentation/Http/Api/V1/Controllers/Admin',
        'src/Presentation/Http/Api/V1/Controllers/Site',
        'src/Presentation/Http/Api/V1/Requests/Item',
        'src/Presentation/Http/Api/V1/Resources/Item',
        'src/Console',
        'config',
        'database/migrations',
        'database/factories',
        'routes',
        'tests',
    ];

    public function handle(Filesystem $files): int
    {
        $name = Str::kebab($this->argument('name'));
        $studly = Str::studly($name);
        $root = $this->repoRoot();
        $backend = "{$root}/packages/cms/{$name}";
        $frontend = "{$root}/packages/frontend/{$name}";

        if ($files->isDirectory($backend)) {
            $this->error("Package cms/{$name} already exists.");

            return self::FAILURE;
        }

        foreach (self::CANONICAL_DIRS as $dir) {
            $files->ensureDirectoryExists("{$backend}/{$dir}");
        }
        $files->ensureDirectoryExists("{$frontend}/src");

        foreach (self::PLACEHOLDER_DIRS as $dir) {
            $files->put("{$backend}/{$dir}/.gitkeep", '');
        }

        $replace = fn (string $stub) => str_replace(
            ['{{name}}', '{{Studly}}', '{{snake}}', '{{CONST}}'],
            [$name, $studly, Str::snake($studly), Str::upper(Str::snake($studly))],
            (string) file_get_contents(__DIR__."/../stubs/{$stub}.stub"),
        );

        // Каркас пакета
        $files->put("{$backend}/composer.json", $replace('composer.json'));
        $files->put("{$backend}/config/cms-{$name}.php", $replace('config.php'));
        $files->put("{$backend}/routes/admin.php", $replace('routes-admin.php'));
        $files->put("{$backend}/routes/public.php", $replace('routes-public.php'));
        $files->put("{$backend}/src/{$studly}Manifest.php", $replace('Manifest.php'));
        $files->put("{$backend}/src/Console/PublishManifestCommand.php", $replace('PublishManifestCommand.php'));
        $files->put("{$backend}/src/Infrastructure/Providers/{$studly}ServiceProvider.php", $replace('ServiceProvider.php'));

        // Domain
        $files->put("{$backend}/src/Domain/Models/Item.php", $replace('Item.php'));
        $files->put("{$backend}/src/Domain/Enums/ItemStatus.php", $replace('ItemStatus.php'));
        $files->put("{$backend}/src/Domain/ValueObjects/ItemTitle.php", $replace('ItemTitle.php'));
        $files->put("{$backend}/src/Domain/Events/ItemSaved.php", $replace('ItemSaved.php'));
        $files->put("{$backend}/src/Domain/Policies/ItemPolicy.php", $replace('ItemPolicy.php'));
        $files->put("{$backend}/src/Domain/Contracts/ItemRepository.php", $replace('ItemRepository.php'));

        // Application
        $files->put("{$backend}/src/Application/Commands/UpsertItemCommand.php", $replace('UpsertItemCommand.php'));
        $files->put("{$backend}/src/Application/Queries/ListItemsQuery.php", $replace('ListItemsQuery.php'));
        $files->put("{$backend}/src/Application/DTOs/Item/ItemDTO.php", $replace('ItemDTO.php'));
        $files->put("{$backend}/src/Application/DTOs/Item/UpsertItemDTO.php", $replace('UpsertItemDTO.php'));
        $files->put("{$backend}/src/Application/Handlers/UpsertItemHandler.php", $replace('UpsertItemHandler.php'));

        // Infrastructure
        $files->put("{$backend}/src/Infrastructure/Persistence/EloquentItemRepository.php", $replace('EloquentItemRepository.php'));

        // Presentation
        $files->put("{$backend}/src/Presentation/Http/Api/V1/Controllers/Admin/ItemController.php", $replace('AdminItemController.php'));
        $files->put("{$backend}/src/Presentation/Http/Api/V1/Controllers/Site/ItemController.php", $replace('SiteItemController.php'));
        $files->put("{$backend}/src/Presentation/Http/Api/V1/Requests/Item/UpsertItemRequest.php", $replace('UpsertItemRequest.php'));
        $files->put("{$backend}/src/Presentation/Http/Api/V1/Resources/Item/ItemResource.php", $replace('ItemResource.php'));

        // database + tests
        $files->put("{$backend}/database/migrations/0001_01_01_000000_create_".Str::snake($studly).'_items_table.php', $replace('migration.php'));
        $files->put("{$backend}/database/factories/ItemFactory.php", $replace('ItemFactory.php'));
        $files->put("{$backend}/tests/TestCase.php", $replace('TestCase.php'));
        $files->put("{$backend}/tests/ItemTest.php", $replace('ItemTest.php'));

        // frontend
        $files->put("{$frontend}/package.json", $replace('frontend-package.json'));
        $files->put("{$frontend}/src/index.ts", $replace('frontend-index.ts'));

        $this->info("Module scaffolded: packages/cms/{$name} + packages/frontend/{$name}");
        $this->line('Next: require в своём приложении, добавить маршрут в gateway, затем `php artisan manifest:publish`.');

        return self::SUCCESS;
    }

    /** Корень монорепозитория: `--base` (тесты и генерация вне репозитория) или два уровня над приложением. */
    private function repoRoot(): string
    {
        $base = $this->option('base');

        return is_string($base) && $base !== ''
            ? rtrim($base, '/')
            : dirname(base_path(), 2);
    }
}
