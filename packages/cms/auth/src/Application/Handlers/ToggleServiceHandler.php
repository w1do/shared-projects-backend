<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ToggleServiceCommand;
use Cms\Auth\Application\Exceptions\AuthRuleViolation;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;

/** Включение/выключение сервиса на проект. Данные при выключении не удаляются. */
final class ToggleServiceHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(ToggleServiceCommand $command): ProjectService
    {
        if (! in_array($command->service, config('cms-auth.services', []), true)) {
            throw AuthRuleViolation::unknownService();
        }

        $record = ProjectService::query()->updateOrCreate(
            ['project_id' => $command->project->id, 'service' => $command->service],
            ['enabled' => $command->enabled, 'enabled_at' => $command->enabled ? now() : null],
        );

        $this->audit->record($command->enabled ? AuditAction::ServiceEnabled : AuditAction::ServiceDisabled, $command->project->id, "service:{$command->service}");
        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'services_changed', 'project_id' => $command->project->id]);

        return $record;
    }
}
