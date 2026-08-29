<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Search;

use Cms\Research\Application\Exceptions\ResearchConfigurationException;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\ValueObjects\ImageResultItem;
use Cms\Research\Domain\ValueObjects\SearchResultItem;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\Response;

/** SerpApi-совместимая служба поиска: адрес и ключ — из окружения. */
final readonly class SerpApiSearchClient implements SerpSearchClient
{
    public function __construct(
        private HttpFactory $http,
        private Config $config,
    ) {}

    /** @return list<SearchResultItem> */
    public function search(string $query, SearchEngine $engine, int $limit): array
    {
        $response = $this->request($query, $engine);

        if ($response->failed()) {
            return [];
        }

        $items = [];

        foreach (array_slice((array) $response->json('organic_results', []), 0, $limit) as $result) {
            if (! is_array($result) || ! isset($result['link'], $result['title'])) {
                continue;
            }

            $items[] = new SearchResultItem(
                position: (int) ($result['position'] ?? count($items) + 1),
                title: (string) $result['title'],
                link: (string) $result['link'],
                snippet: isset($result['snippet']) ? (string) $result['snippet'] : null,
            );
        }

        return $items;
    }

    /** @return list<ImageResultItem> */
    public function searchImages(string $query, SearchEngine $engine, int $limit): array
    {
        $response = $this->request($query, $engine);

        // Пустая выдача — не ошибка, а вот отказ службы оператор обязан увидеть
        if ($response->failed()) {
            throw ResearchRuleViolation::imageSearchUnavailable();
        }

        $items = [];

        foreach (array_slice((array) $response->json('images_results', []), 0, max($limit, 0)) as $result) {
            if (! is_array($result)) {
                continue;
            }

            $link = $result['original'] ?? $result['link'] ?? null;
            if (! is_string($link) || $link === '') {
                continue;
            }

            $items[] = new ImageResultItem(
                link: $link,
                thumbnail: isset($result['thumbnail']) ? (string) $result['thumbnail'] : null,
                width: isset($result['original_width']) ? (int) $result['original_width'] : null,
                height: isset($result['original_height']) ? (int) $result['original_height'] : null,
                source: isset($result['source']) ? (string) $result['source'] : null,
            );
        }

        return $items;
    }

    private function request(string $query, SearchEngine $engine): Response
    {
        $apiKey = $this->config->get('cms-research.serpapi.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw ResearchConfigurationException::missingSearchKey();
        }

        return $this->http
            ->baseUrl((string) $this->config->get('cms-research.serpapi.base_url'))
            ->timeout((int) $this->config->get('cms-research.serpapi.timeout', 30))
            ->get('/search.json', [
                'engine' => $engine->value,
                $engine->queryParam() => $query,
                'api_key' => $apiKey,
            ]);
    }
}
