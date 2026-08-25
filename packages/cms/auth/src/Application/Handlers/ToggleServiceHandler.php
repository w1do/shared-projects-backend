<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;
use Illuminate\Validation\ValidationException;

/** Включение/выключение сервиса на проект. Данные при выключении не удаляются. */
final class ToggleServiceHandler
{
    public function handle(ToggleServiceCommand $command): ProjectService
    {
        if (! in_array($command->service, config('cms-auth.services', []), true)) {
            throw ValidationException::withMessages(['service' => ['Unknown service.']]);
        }

        $record = ProjectService::query()->updateOrCreate(
            ['project_id' => $command->project->id, 'service' => $command->service],
            ['enabled' => $command->enabled, 'enabled_at' => $command->enabled ? now() : null],
        );

        Audit::record($command->enabled ? 'service.enabled' : 'service.disabled', $command->project->id, "service:{$command->service}");
        BootstrapCache::bump();
        DownstreamNotifier::cacheBust(['reason' => 'services_changed', 'project_id' => $command->project->id]);

        return $record;
    }
}
