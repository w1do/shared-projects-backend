<?php

declare(strict_types=1);

namespace Cms\Research\Application\Queries;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Embed\EmbedRequestDTO;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
use Cms\Shared\Tenant\ProjectContext;

/** Смысловой поиск по базе знаний текущего проекта. */
final readonly class SearchKnowledgeQuery
{
    public function __construct(
        private ProjectContext $context,
        private KnowledgeBase $knowledge,
        private AiOperations $ai,
    ) {}

    /** @return list<KnowledgeHit> */
    public function handle(string $query, int $limit = 10, ?KnowledgeFilter $filter = null): array
    {
        $vectors = $this->ai->embed(new EmbedRequestDTO(texts: [$query]))->vectors;

        if ($vectors === []) {
            return [];
        }

        return $this->knowledge->search($this->context->required(), $vectors[0], $limit, $filter);
    }
}
