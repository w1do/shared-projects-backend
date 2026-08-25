<?php

declare(strict_types=1);

namespace Cms\Auth\Console;

use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\AuthManifest;
use Illuminate\Console\Command;

/**
 * auth-service регистрирует собственный манифест локально (без HTTP).
 *
 * Имя класса — `...ConsoleCommand`: «command» консоли и «command» CQRS — разные
 * вещи, и одноимённые классы раньше приходилось разводить алиасом в каждом файле,
 * который видел оба.
 */
final class PublishManifestConsoleCommand extends Command
{
    protected $signature = 'manifest:publish';

    protected $description = 'Register the auth service manifest (permissions, navigation)';

    public function handle(PublishManifestHandler $handler): int
    {
        $record = $handler->handle(new PublishManifestCommand(AuthManifest::build()));
        $this->info("Manifest '{$record->key}' v{$record->version} published.");

        return self::SUCCESS;
    }
}
