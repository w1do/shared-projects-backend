<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Ai\Application\Exceptions\AiException;

/**
 * Разбивка запроса на короткие семантические подзапросы для поиска.
 *
 * Отказ модели не валит исследование: поиск идёт по исходному запросу.
 */
final readonly class SplitPromptIntoSubQueriesAction
{
    private const RULE = 'Разбей пользовательский запрос на короткие семантические подзапросы для поиска в поисковых системах. Подзапросы должны покрывать тему с разных сторон и не повторять друг друга.';

    public function __construct(private AiOperations $ai) {}

    /** @return list<string> */
    public function handle(string $query, int $count): array
    {
        try {
            $result = $this->ai->runInstruct(new RunInstructRequestDTO(
                rule: self::RULE." Верни ровно {$count} подзапросов.",
                schema: [
                    'type' => 'object',
                    'properties' => [
                        'sub_queries' => ['type' => 'array', 'items' => ['type' => 'string']],
                    ],
                    'required' => ['sub_queries'],
                ],
                input: ['query' => $query, 'count' => $count],
            ));
        } catch (AiException) {
            return [$query];
        }

        $subQueries = $result->output['sub_queries'] ?? null;

        if (! is_array($subQueries)) {
            return [$query];
        }

        $normalized = array_values(array_unique(array_filter(
            array_map(static fn (mixed $value): string => is_string($value) ? trim($value) : '', $subQueries),
            static fn (string $value): bool => $value !== '',
        )));

        $normalized = array_slice($normalized, 0, $count);

        return $normalized !== [] ? $normalized : [$query];
    }
}
