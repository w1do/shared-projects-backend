<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Handlers;

use Cms\Instructs\Application\Commands\DeleteInstructCommand;
use Cms\Instructs\Application\Exceptions\InstructRuleViolation;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Instructs\Domain\Policies\InstructPolicy;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Eloquent\ModelNotFoundException;

final readonly class DeleteInstructHandler
{
    public function __construct(
        private ProjectContext $context,
        private InstructPolicy $policy,
    ) {}

    public function handle(DeleteInstructCommand $command): void
    {
        $projectId = $this->context->required();

        $instruct = Instruct::query()
            ->whereKey($command->instructId)
            ->first();

        if ($instruct === null) {
            throw (new ModelNotFoundException)->setModel(Instruct::class, [$command->instructId]);
        }

        $response = $this->policy->delete($instruct, $projectId);

        if ($response->denied()) {
            throw InstructRuleViolation::systemInstructIsReadOnly((string) $response->message());
        }

        // Мягкое удаление: снимки применения ссылаются на инструкцию и обязаны
        // оставаться читаемыми после её удаления.
        $instruct->delete();
    }
}
