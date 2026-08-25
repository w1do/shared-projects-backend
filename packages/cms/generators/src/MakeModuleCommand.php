<?php

declare(strict_types=1);

namespace Cms\Generators;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

/**
 * make:module <name> — скаффолд пары пакетов по канонической структуре:
 * backend packages/cms/<name> (Domain/Application/Infrastructure/Presentation,
 * манифест, провайдер, тесты) и frontend packages/frontend/<name>.
 */
final class MakeModuleCommand extends Command
{
    protected $signature = 'make:module {name : kebab-case имя модуля}';

    protected $description = 'Scaffold a backend + frontend package pair for a new platform module';

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

        foreach ([
            'Domain/Models', 'Domain/Enums', 'Domain/ValueObjects', 'Domain/Events', 'Domain/Policies', 'Domain/Contracts',
            'Application/Commands', 'Application/Queries', 'Application/DTOs', 'Application/Handlers',
            'Infrastructure/Persistence', 'Infrastructure/Providers', 'Infrastructure/Jobs',
            'Presentation/Http/Api/V1/Controllers/Admin', 'Presentation/Http/Api/V1/Controllers/Site',
            'Console',
        ] as $dir) {
            $files->ensureDirectoryExists("{$backend}/src/{$dir}");
        }
        $files->ensureDirectoryExists("{$backend}/database/migrations");
        $files->ensureDirectoryExists("{$backend}/database/factories");
        $files->ensureDirectoryExists("{$backend}/routes");
        $files->ensureDirectoryExists("{$backend}/tests");
        $files->ensureDirectoryExists("{$frontend}/src");

        $replace = fn (string $stub) => str_replace(
            ['{{name}}', '{{Studly}}'],
            [$name, $studly],
            (string) file_get_contents(__DIR__."/../stubs/{$stub}.stub"),
        );

        $files->put("{$backend}/composer.json", $replace('composer.json'));
        $files->put("{$backend}/src/{$studly}ServiceProvider.php", $replace('ServiceProvider.php'));
        $files->put("{$backend}/src/{$studly}Manifest.php", $replace('Manifest.php'));
        $files->put("{$backend}/src/Console/PublishManifestCommand.php", $replace('PublishManifestCommand.php'));
        $files->put("{$backend}/routes/admin.php", $replace('routes-admin.php'));
        $files->put("{$backend}/routes/public.php", $replace('routes-public.php'));
        $files->put("{$backend}/tests/.gitkeep", '');
        $files->put("{$frontend}/package.json", $replace('frontend-package.json'));
        $files->put("{$frontend}/src/index.ts", $replace('frontend-index.ts'));

        $this->info("Module scaffolded: packages/cms/{$name} + packages/frontend/{$name}");
        $this->line('Next: require в своём приложении, добавить маршрут в gateway, затем `php artisan manifest:publish`.');

        return self::SUCCESS;
    }

    private function repoRoot(): string
    {
        return dirname(base_path(), 2);
    }
}
