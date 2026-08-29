<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\ExtractTopics\ExtractTopicsRequestDTO;
use Cms\Ai\Application\DTOs\ExtractTopics\TopicSuggestionDTO;
use Cms\Content\Domain\Models\Category;
use Cms\Instructs\Application\Actions\RecordInstructUsageAction;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Research\Application\Commands\ExtractTopicsCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Cms\Research\Domain\Models\ResearchTopic;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Темы постов по материалам исследования.
 *
 * Материал берётся из источников исследования — тех же текстов, что уходят в
 * базу знаний: темы не должны ждать окончания индексации.
 */
final readonly class ExtractTopicsHandler
{
    private const DEFAULT_COUNT = 10;

    public function __construct(
        private AiOperations $ai,
        private ResolveInstructAction $instructs,
        private RecordInstructUsageAction $usages,
    ) {}

    /** @return list<ResearchTopic> */
    public function handle(ExtractTopicsCommand $command): array
    {
        $research = Research::query()->whereKey($command->researchId)->first();

        if ($research === null) {
            throw (new ModelNotFoundException)->setModel(Research::class, [$command->researchId]);
        }

        if ($research->status !== ResearchStatus::Done) {
            throw ResearchRuleViolation::researchNotCompleted();
        }

        $instruct = $this->instructs->handle(InstructCategory::PostTopics);
        $categories = $this->projectCategories();

        $suggestions = $this->ai->extractTopics(new ExtractTopicsRequestDTO(
            query: $research->query,
            materials: $this->materials($research),
            maxCount: $command->maxCount ?? $this->countFromInstruct($instruct->schema),
            categories: array_keys($categories),
            rule: $instruct->rule,
        ))->topics;

        $topics = $this->persist($research, $suggestions, $categories);

        if ($topics !== []) {
            $this->usages->handle($instruct, $research);
        }

        return $topics;
    }

    /** @return list<string> */
    private function materials(Research $research): array
    {
        $materials = $research->sources()
            ->orderBy('position')
            ->get()
            ->map(static fn (ResearchSource $source): string => trim(($source->title ?? '')."\n".$source->content))
            ->all();

        if ($research->summary !== null && trim($research->summary) !== '') {
            array_unshift($materials, $research->summary);
        }

        return array_values($materials);
    }

    /** @return array<string, int> название категории → id */
    private function projectCategories(): array
    {
        $categories = [];

        foreach (Category::query()->get() as $category) {
            $categories[(string) $category->name] = (int) $category->getKey();
        }

        return $categories;
    }

    /**
     * Число тем задаёт применяемая инструкция: `maxItems` её схемы. Значение по
     * умолчанию используется, только если инструкция его не объявила.
     *
     * @param  array<string, mixed>  $schema
     */
    private function countFromInstruct(array $schema): int
    {
        $topics = $schema['properties']['topics'] ?? null;

        if (is_array($topics) && isset($topics['maxItems']) && is_numeric($topics['maxItems'])) {
            return max(1, (int) $topics['maxItems']);
        }

        return self::DEFAULT_COUNT;
    }

    /**
     * Повторное извлечение не плодит дубликаты и не сбрасывает состояние
     * использованных и отклонённых тем: уже существующие заголовки пропускаются.
     *
     * @param  list<TopicSuggestionDTO>  $suggestions
     * @param  array<string, int>  $categories
     * @return list<ResearchTopic>
     */
    private function persist(Research $research, array $suggestions, array $categories): array
    {
        $existing = $research->topics()->pluck('title')
            ->map(static fn (string $title): string => mb_strtolower($title))
            ->all();

        $created = [];

        foreach ($suggestions as $suggestion) {
            $title = trim($suggestion->title);

            if ($title === '' || in_array(mb_strtolower($title), $existing, true)) {
                continue;
            }

            $existing[] = mb_strtolower($title);
            $categoryId = $this->matchCategory($suggestion->category, $categories);

            $created[] = ResearchTopic::create([
                'project_id' => $research->project_id,
                'research_id' => $research->getKey(),
                'title' => $title,
                'rationale' => $suggestion->rationale,
                'category_id' => $categoryId,
                'suggested_category' => $categoryId === null ? $suggestion->category : null,
            ]);
        }

        return $created;
    }

    /** @param array<string, int> $categories */
    private function matchCategory(?string $name, array $categories): ?int
    {
        if ($name === null || trim($name) === '') {
            return null;
        }

        foreach ($categories as $categoryName => $id) {
            if (mb_strtolower($categoryName) === mb_strtolower($name)) {
                return $id;
            }
        }

        return null;
    }
}
