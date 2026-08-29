<?php

declare(strict_types=1);

namespace Cms\Research\Application\Queries;

use Cms\Research\Application\Exceptions\ResearchConfigurationException;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\SearchEngine;
use Cms\Research\Domain\ValueObjects\ImageResultItem;
use Illuminate\Contracts\Config\Repository as Config;

/** Подбор изображений по запросу оператора: движок и предел выдачи — из окружения. */
final class SearchImagesQuery
{
    public function __construct(
        private readonly SerpSearchClient $client,
        private readonly Config $config,
    ) {}

    /** @return list<ImageResultItem> */
    public function handle(string $query, ?int $limit = null): array
    {
        $max = (int) $this->config->get('cms-research.image_results_limit', 24);

        return $this->client->searchImages(
            $query,
            $this->engine(),
            $limit === null ? $max : max(1, min($limit, $max)),
        );
    }

    private function engine(): SearchEngine
    {
        $engine = SearchEngine::tryFrom((string) $this->config->get('cms-research.image_engine', 'google_images'));

        if ($engine === null || ! $engine->isImages()) {
            throw ResearchConfigurationException::unknownImageEngine();
        }

        return $engine;
    }
}
