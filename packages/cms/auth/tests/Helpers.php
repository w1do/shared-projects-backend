<?php

declare(strict_types=1);

use Cms\Auth\Application\Commands\CreateProjectCommand;
use Cms\Auth\Application\Commands\PublishManifestCommand;
use Cms\Auth\Application\DTOs\Project\CreateProjectDTO;
use Cms\Auth\Application\Handlers\CreateProjectHandler;
use Cms\Auth\Application\Handlers\PublishManifestHandler;
use Cms\Auth\AuthManifest;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;

/** Регистрирует манифест auth-модуля (права в БД). */
function syncAuthManifest(): void
{
    app(PublishManifestHandler::class)->handle(new PublishManifestCommand(AuthManifest::build()));
}

/** Создаёт проект от имени оператора через команду (owner + системные роли). */
function createProjectFor(Admin $admin, string $key = 'site-a', ?array $locales = null): Project
{
    $payload = ['key' => $key, 'name' => strtoupper($key)] + ($locales === null ? [] : ['locales' => $locales]);

    return app(CreateProjectHandler::class)->handle(new CreateProjectCommand(
        CreateProjectDTO::from($payload),
        $admin,
    ));
}

function adminHeaders(Admin $admin): array
{
    return ['Authorization' => 'Bearer '.$admin->createToken('test')->plainTextToken];
}
