<?php

declare(strict_types=1);

use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\Contracts\PageContentFetcher;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
use Cms\Research\Domain\ValueObjects\KnowledgePoint;
use Cms\Research\Domain\ValueObjects\PageContent;
use Cms\Research\Domain\ValueObjects\SearchResultItem;

/** Выдача поиска задаётся тестом: сеть в юнит-контуре недоступна. */
final class FakeSerpSearchClient implements SerpSearchClient
{
    public int $calls = 0;

    /** @param array<string, list<SearchResultItem>> $resultsByQuery */
    public function __construct(private array $resultsByQuery = [], private array $fallback = []) {}

    public function search(string $query, SearchEngine $engine, int $limit): array
    {
        $this->calls++;

        return array_slice($this->resultsByQuery[$query] ?? $this->fallback, 0, $limit);
    }
}

/** Загрузка страниц: недоступные адреса возвращают null, как и настоящий фетчер. */
final class FakePageContentFetcher implements PageContentFetcher
{
    /** @param array<string, PageContent|null> $pages */
    public function __construct(private array $pages = []) {}

    public function fetch(string $url): ?PageContent
    {
        return $this->pages[$url] ?? null;
    }
}

/** База знаний в памяти: контракт порта проверяется без Qdrant. */
final class InMemoryKnowledgeBase implements KnowledgeBase
{
    public bool $provisioned = false;

    public ?string $failWith = null;

    /** @var array<string, array<string, KnowledgePoint>> */
    public array $points = [];

    public function provision(): void
    {
        $this->provisioned = true;
    }

    public function upsert(string $projectId, array $points): int
    {
        if ($this->failWith !== null) {
            throw new RuntimeException($this->failWith);
        }

        $written = 0;

        foreach ($points as $point) {
            if ($point->missingMetadata() !== []) {
                continue;
            }

            $this->points[$projectId]["{$point->researchId}|{$point->sourceUrl}"] = $point;
            $written++;
        }

        return $written;
    }

    public function search(string $projectId, array $vector, int $limit, ?KnowledgeFilter $filter = null): array
    {
        $hits = [];

        foreach ($this->points[$projectId] ?? [] as $point) {
            if ($filter?->category !== null && $point->category !== $filter->category) {
                continue;
            }

            if ($filter?->researchId !== null && $point->researchId !== $filter->researchId) {
                continue;
            }

            $hits[] = new KnowledgeHit(
                topic: $point->topic,
                query: $point->query,
                content: $point->content,
                category: $point->category,
                createdAt: $point->createdAt,
                score: 1.0,
                researchId: $point->researchId,
                sourceUrl: $point->sourceUrl,
                sourceTitle: $point->sourceTitle,
            );
        }

        return array_slice($hits, 0, $limit);
    }

    public function forget(string $projectId): void
    {
        unset($this->points[$projectId]);
    }
}

/** @param list<array{0: string, 1: string}> $links пары [url, заголовок] */
function fakeSerpResults(array $links): array
{
    $items = [];

    foreach ($links as $index => [$url, $title]) {
        $items[] = new SearchResultItem(position: $index + 1, title: $title, link: $url);
    }

    return $items;
}
