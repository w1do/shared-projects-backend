<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Handlers;

use Cms\Instructs\Application\Commands\UpsertInstructCommand;
use Cms\Instructs\Application\Exceptions\InstructRuleViolation;
use Cms\Instructs\Domain\Contracts\ResponseSchemaValidator;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Instructs\Domain\Policies\InstructPolicy;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Eloquent\ModelNotFoundException;

final readonly class UpsertInstructHandler
{
    public function __construct(
        private ProjectContext $context,
        private ResponseSchemaValidator $schemas,
        private InstructPolicy $policy,
    ) {}

    public function handle(UpsertInstructCommand $command): Instruct
    {
        $projectId = $this->context->required();
        $category = $this->category($command->data->category);
        $this->assertSchemaSupported($command->data->schema);

        $instruct = $this->target($command, $projectId);

        $instruct->fill([
            'project_id' => $projectId,
            'title' => $command->data->title,
            'category' => $category,
            'rule' => $command->data->rule,
            'schema' => $command->data->schema,
            'published' => $command->data->published,
        ]);

        if ($instruct->author_id === null) {
            $instruct->author_id = $command->authorId;
        }

        $instruct->save();

        if ($instruct->published) {
            $this->unpublishSiblings($instruct, $projectId);
        }

        return $instruct;
    }

    private function category(string $value): InstructCategory
    {
        return InstructCategory::tryFrom($value) ?? throw InstructRuleViolation::unknownCategory($value);
    }

    /** @param array<string, mixed> $schema */
    private function assertSchemaSupported(array $schema): void
    {
        $reason = $this->schemas->rejectionReason($schema);

        if ($reason !== null) {
            throw InstructRuleViolation::invalidSchema($reason);
        }
    }

    private function target(UpsertInstructCommand $command, string $projectId): Instruct
    {
        if ($command->instructId === null) {
            return new Instruct;
        }

        $instruct = Instruct::query()
            ->whereKey($command->instructId)
            ->first();

        if ($instruct === null) {
            throw (new ModelNotFoundException)->setModel(Instruct::class, [$command->instructId]);
        }

        $response = $this->policy->update($instruct, $projectId);

        if ($response->denied()) {
            throw InstructRuleViolation::systemInstructIsReadOnly((string) $response->message());
        }

        return $instruct;
    }

    /** Применяемая инструкция категории одна: публикация снимает публикацию с прочих. */
    private function unpublishSiblings(Instruct $instruct, string $projectId): void
    {
        Instruct::query()
            ->ownedBy($projectId)
            ->where('category', $instruct->category)
            ->where('published', true)
            ->whereKeyNot($instruct->getKey())
            ->update(['published' => false]);
    }
}
