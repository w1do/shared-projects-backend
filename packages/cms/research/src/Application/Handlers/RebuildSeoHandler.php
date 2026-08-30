<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Domain\Enums\SeoableType;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Research\Application\Actions\ComposeCategorySeoAction;
use Cms\Research\Application\Actions\ComposePostSeoAction;
use Cms\Research\Application\Commands\RebuildSeoCommand;
use Cms\Research\Application\DTOs\Seo\SeoRebuildResultDTO;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Throwable;

/**
 * Пересборка SEO-полей по AI для сущностей контента проекта.
 *
 * Модель заполняет только текстовые поля; canonical, robots, og:image и JSON-LD
 * остаются такими, какими их оставил оператор. Отказ по сущности не прерывает
 * задачу и не затирает её прежние поля.
 */
final readonly class RebuildSeoHandler
{
    /** Поля, которые задаёт оператор, а не модель. */
    private const OPERATOR_FIELDS = ['canonical', 'robots', 'og_image', 'json_ld'];

    public function __construct(
        private ResolveInstructAction $instructs,
        private ComposePostSeoAction $postSeo,
        private ComposeCategorySeoAction $categorySeo,
        private UpsertSeoHandler $seo,
        private TaskProgress $progress,
    ) {}

    public function handle(RebuildSeoCommand $command): SeoRebuildResultDTO
    {
        $entities = $command->entities === [] ? $this->allEntities() : $this->listed($command->entities);
        $total = count($entities);

        $processed = 0;
        $lastError = null;

        foreach ($entities as $entity) {
            try {
                $this->rebuild($entity);
                $processed++;
            } catch (Throwable $error) {
                $lastError = $error;
            }

            $this->stage($command, $processed.'/'.$total);
        }

        return new SeoRebuildResultDTO($processed, $total, $lastError);
    }

    private function rebuild(Post|Page|Category $entity): void
    {
        $fresh = $entity instanceof Category
            ? $this->categorySeo->handle($this->instructs->handle(InstructCategory::CategorySeo), $entity)
            : $this->postSeo->handle($this->instructs->handle(InstructCategory::PostSeo), $entity, $entity->title);

        $this->seo->handle(new UpsertSeoCommand($entity, $this->keepingOperatorFields($entity, $fresh)));
    }

    private function keepingOperatorFields(Post|Page|Category $entity, UpsertSeoDTO $fresh): UpsertSeoDTO
    {
        $stored = $entity->seo;

        if ($stored === null) {
            return $fresh;
        }

        $payload = $fresh->toArray();

        foreach (self::OPERATOR_FIELDS as $field) {
            $payload[$field] = $stored->{$field};
        }

        return UpsertSeoDTO::from($payload);
    }

    /** @return list<Post|Page|Category> */
    private function allEntities(): array
    {
        return array_merge(
            Post::query()->with('seo')->get()->all(),
            Page::query()->with('seo')->get()->all(),
            Category::query()->with('seo')->get()->all(),
        );
    }

    /**
     * @param  list<array{type: string, id: int}>  $entities
     * @return list<Post|Page|Category>
     */
    private function listed(array $entities): array
    {
        $found = [];

        foreach ($entities as $entity) {
            $record = match (SeoableType::from($entity['type'])) {
                SeoableType::Post => Post::query()->with('seo')->find($entity['id']),
                SeoableType::Page => Page::query()->with('seo')->find($entity['id']),
                SeoableType::Category => Category::query()->with('seo')->find($entity['id']),
            };

            if ($record !== null) {
                $found[] = $record;
            }
        }

        return $found;
    }

    private function stage(RebuildSeoCommand $command, string $stage): void
    {
        if ($command->taskId !== null) {
            $this->progress->stage($command->taskId, $stage);
        }
    }
}
