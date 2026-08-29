<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Research\Domain\ValueObjects\PageContent;

/** Сводный текст исследования по собранным источникам. */
final readonly class SummarizeSourcesAction
{
    private const RULE = 'Собери сводный материал по запросу пользователя на основе найденных источников. Опирайся только на переданный контекст, пиши структурировано и по делу, без выдуманных фактов.';

    public function __construct(private AiOperations $ai) {}

    /** @param list<PageContent> $sources */
    public function handle(string $query, array $sources, ?string $offer = null): string
    {
        $rule = self::RULE;

        if ($offer !== null && trim($offer) !== '') {
            $rule .= ' В конце органично, без навязчивой рекламы, вплети предложение компании, связав его с темой запроса.';
        }

        $result = $this->ai->runInstruct(new RunInstructRequestDTO(
            rule: $rule,
            schema: [
                'type' => 'object',
                'properties' => ['summary' => ['type' => 'string']],
                'required' => ['summary'],
            ],
            input: [
                'query' => $query,
                'offer' => $offer,
                'sources' => array_map(
                    static fn (PageContent $source): array => [
                        'url' => $source->link,
                        'title' => $source->title,
                        'content' => $source->content,
                    ],
                    $sources,
                ),
            ],
        ));

        $summary = $result->output['summary'] ?? '';

        return is_string($summary) ? $summary : '';
    }
}
