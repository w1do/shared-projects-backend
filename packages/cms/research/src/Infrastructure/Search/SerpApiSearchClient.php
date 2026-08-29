<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Search;

use Cms\Research\Application\Exceptions\ResearchConfigurationException;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\ValueObjects\SearchResultItem;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Http\Client\Factory as HttpFactory;

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
        $apiKey = $this->config->get('cms-research.serpapi.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw ResearchConfigurationException::missingSearchKey();
        }

        $response = $this->http
            ->baseUrl((string) $this->config->get('cms-research.serpapi.base_url'))
            ->timeout((int) $this->config->get('cms-research.serpapi.timeout', 30))
            ->get('/search.json', [
                'engine' => $engine->value,
                $engine->queryParam() => $query,
                'api_key' => $apiKey,
            ]);

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
}
