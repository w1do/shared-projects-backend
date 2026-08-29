<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Jobs;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Instructs\Application\Actions\RecordInstructUsageAction;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Research\Application\Actions\CreateCategoryTreeAction;
use Cms\Research\Domain\Enums\BuildoutStatus;
use Cms\Research\Domain\Models\ProjectBuildout;
use Cms\Shared\AuthClient\AuthClient;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Сборка проекта по AI: инструкция проекта → описание, тематика и дерево категорий.
 *
 * Двухфазного коммита между сервисами нет: категории применяются одной
 * транзакцией, поля проекта — одним внутренним вызовом, порядок фиксирован
 * (категории → проект), повтор идемпотентен.
 */
final class BuildProjectJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [10, 30, 120];

    public int $timeout = 300;

    public function __construct(
        public readonly string $projectId,
        public readonly int $buildoutId,
        public readonly ?int $taskId = null,
    ) {}

    public function handle(
        ProjectContext $context,
        AiOperations $ai,
        ResolveInstructAction $instructs,
        RecordInstructUsageAction $usages,
        CreateCategoryTreeAction $categories,
        AuthClient $auth,
        TaskProgress $progress,
    ): void {
        // Синхронная диспетчеризация выполняет джобу внутри чужого контекста:
        // прежнее значение возвращается, иначе вложенный запуск обнулил бы
        // проект вызывающего.
        $previous = $context->id();
        $context->set($this->projectId);

        try {
            $buildout = ProjectBuildout::query()->whereKey($this->buildoutId)->first();

            if ($buildout === null || $buildout->status->isFinal()) {
                return;
            }

            $this->stage($progress, 'ai_request', start: true);

            $instruct = $instructs->handle(InstructCategory::ProjectDescription);

            $output = $ai->runInstruct(new RunInstructRequestDTO(
                rule: $instruct->rule,
                schema: $instruct->schema,
                input: ['topic' => $buildout->topic, 'project_id' => $this->projectId],
            ))->output;

            $this->stage($progress, 'categories');
            $rows = $this->categoryRows($output, $instruct, $ai, $instructs);

            // Порядок фиксирован: сначала категории (одной транзакцией),
            // затем поля проекта (одним вызовом).
            $created = $categories->handle($rows);

            $this->stage($progress, 'project_profile');
            $updated = $auth->setProjectProfile(
                projectId: $this->projectId,
                description: $this->text($output, 'description'),
                topic: $this->text($output, 'topic') ?? $buildout->topic,
                overwrite: $buildout->overwrite,
            );

            $usages->handle($instruct, $buildout);

            $buildout->forceFill([
                'status' => BuildoutStatus::Done,
                'categories_created' => $created,
                'project_updated' => $updated,
                'completed_at' => $buildout->freshTimestamp(),
            ])->save();

            if ($this->taskId !== null) {
                $progress->succeed($this->taskId);
            }
        } finally {
            $previous === null ? $context->clear() : $context->set($previous);
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('project buildout failed', [
            'project' => $this->projectId,
            'buildout' => $this->buildoutId,
            'error' => $exception?->getMessage(),
        ]);

        $buildout = ProjectBuildout::acrossProjects()->whereKey($this->buildoutId)->first();

        if ($buildout === null || $buildout->status->isFinal()) {
            return;
        }

        $buildout->forceFill([
            'status' => BuildoutStatus::Failed,
            'error_message' => $exception?->getMessage() ?? 'Project buildout job failed.',
            'completed_at' => $buildout->freshTimestamp(),
        ])->save();

        if ($this->taskId !== null && $exception !== null) {
            app(TaskProgress::class)->fail($this->taskId, $exception);
        }
    }

    private function stage(TaskProgress $progress, string $stage, bool $start = false): void
    {
        if ($this->taskId === null) {
            return;
        }

        $start ? $progress->start($this->taskId, $stage) : $progress->stage($this->taskId, $stage);
    }

    /**
     * Категории берутся из ответа сборки. Если её схема их не объявляет —
     * применяется инструкция категории «дерево категорий».
     *
     * @param  array<string, mixed>  $output
     * @return list<array{name: string, slug: string, parent_slug: ?string}>
     */
    private function categoryRows(
        array $output,
        Instruct $instruct,
        AiOperations $ai,
        ResolveInstructAction $instructs,
    ): array {
        if (isset($output['categories']) && is_array($output['categories'])) {
            return $this->normalizeCategories($output['categories']);
        }

        $tree = $instructs->handle(InstructCategory::CategoryTree);

        $treeOutput = $ai->runInstruct(new RunInstructRequestDTO(
            rule: $tree->rule,
            schema: $tree->schema,
            input: [
                'topic' => $this->text($output, 'topic') ?? '',
                'description' => $this->text($output, 'description') ?? '',
            ],
        ))->output;

        return isset($treeOutput['categories']) && is_array($treeOutput['categories'])
            ? $this->normalizeCategories($treeOutput['categories'])
            : [];
    }

    /**
     * @param  array<int|string, mixed>  $rows
     * @return list<array{name: string, slug: string, parent_slug: ?string}>
     */
    private function normalizeCategories(array $rows): array
    {
        $normalized = [];

        foreach ($rows as $row) {
            if (! is_array($row) || ! isset($row['name'])) {
                continue;
            }

            $parent = $row['parent_slug'] ?? null;

            $normalized[] = [
                'name' => (string) $row['name'],
                'slug' => (string) ($row['slug'] ?? ''),
                'parent_slug' => is_string($parent) && $parent !== '' ? $parent : null,
            ];
        }

        return $normalized;
    }

    /** @param array<string, mixed> $output */
    private function text(array $output, string $key): ?string
    {
        $value = $output[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
