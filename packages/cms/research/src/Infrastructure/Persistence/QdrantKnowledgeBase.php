<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Persistence;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Research\Application\Exceptions\ResearchConfigurationException;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
use Cms\Research\Domain\ValueObjects\KnowledgePoint;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * База знаний поверх REST API Qdrant.
 *
 * Одна коллекция на все проекты с индексом по `project_id` и обязательным
 * фильтром по нему в каждом запросе — рекомендованная Qdrant модель
 * мультитенантности: коллекция-на-проект дорога по памяти.
 *
 * Идентификатор точки — детерминированный UUIDv5 от проекта, исследования и
 * адреса источника: повторная запись перезаписывает ту же точку.
 */
final readonly class QdrantKnowledgeBase implements KnowledgeBase
{
    /** Пространство имён UUIDv5 идентификаторов точек (фиксировано для платформы). */
    private const NAMESPACE_UUID = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

    public function __construct(
        private HttpFactory $http,
        private Config $config,
        private AiOperations $ai,
    ) {}

    public function provision(): void
    {
        $collection = $this->collection();
        $existing = $this->client()->get("/collections/{$collection}");

        if ($existing->successful()) {
            return;
        }

        $created = $this->client()->put("/collections/{$collection}", [
            'vectors' => ['size' => $this->ai->embeddingDimension(), 'distance' => 'Cosine'],
        ]);

        if ($created->failed()) {
            throw new RuntimeException("Knowledge base collection '{$collection}' could not be created.");
        }

        // Индекс по project_id: без него фильтр мультитенантности читает всю коллекцию.
        $this->client()->put("/collections/{$collection}/index", [
            'field_name' => 'project_id',
            'field_schema' => 'keyword',
        ]);
    }

    public function upsert(string $projectId, array $points): int
    {
        $payload = [];

        foreach ($points as $point) {
            $missing = $point->missingMetadata();

            if ($missing !== []) {
                // Обязательные метаданные — условие записи: причина в журнал,
                // точка в хранилище не уходит.
                Log::warning('knowledge point rejected: incomplete metadata', [
                    'project' => $projectId,
                    'research' => $point->researchId,
                    'source' => $point->sourceUrl,
                    'missing' => $missing,
                ]);

                continue;
            }

            $payload[] = [
                'id' => $this->pointId($projectId, $point),
                'vector' => $point->vector,
                'payload' => array_filter([
                    'project_id' => $projectId,
                    'topic' => $point->topic,
                    'query' => $point->query,
                    'content' => $point->content,
                    'category' => $point->category,
                    'created_at' => $point->createdAt,
                    'research_id' => $point->researchId,
                    'source_id' => $point->sourceId,
                    'source_url' => $point->sourceUrl,
                    'source_title' => $point->sourceTitle,
                ], static fn (mixed $value): bool => $value !== null),
            ];
        }

        if ($payload === []) {
            return 0;
        }

        $response = $this->client()->put(
            "/collections/{$this->collection()}/points?wait=true",
            ['points' => $payload],
        );

        if ($response->failed()) {
            throw new RuntimeException('Knowledge base rejected the points upsert.');
        }

        return count($payload);
    }

    public function search(string $projectId, array $vector, int $limit, ?KnowledgeFilter $filter = null): array
    {
        if ($vector === []) {
            return [];
        }

        $response = $this->client()->post("/collections/{$this->collection()}/points/search", [
            'vector' => $vector,
            'limit' => $limit,
            'with_payload' => true,
            'filter' => $this->filter($projectId, $filter),
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Knowledge base search failed.');
        }

        $hits = [];

        foreach ((array) $response->json('result', []) as $row) {
            if (! is_array($row) || ! is_array($row['payload'] ?? null)) {
                continue;
            }

            $payload = $row['payload'];

            $hits[] = new KnowledgeHit(
                topic: (string) ($payload['topic'] ?? ''),
                query: (string) ($payload['query'] ?? ''),
                content: (string) ($payload['content'] ?? ''),
                category: (string) ($payload['category'] ?? ''),
                createdAt: (string) ($payload['created_at'] ?? ''),
                score: (float) ($row['score'] ?? 0.0),
                researchId: isset($payload['research_id']) ? (int) $payload['research_id'] : null,
                sourceUrl: isset($payload['source_url']) ? (string) $payload['source_url'] : null,
                sourceTitle: isset($payload['source_title']) ? (string) $payload['source_title'] : null,
            );
        }

        return $hits;
    }

    public function forget(string $projectId): void
    {
        $this->client()->post(
            "/collections/{$this->collection()}/points/delete?wait=true",
            ['filter' => $this->filter($projectId)],
        );
    }

    /**
     * Фильтр всегда содержит project_id: без него выдача пересекла бы проекты.
     *
     * @return array<string, mixed>
     */
    private function filter(string $projectId, ?KnowledgeFilter $filter = null): array
    {
        $must = [['key' => 'project_id', 'match' => ['value' => $projectId]]];

        if ($filter?->category !== null && $filter->category !== '') {
            $must[] = ['key' => 'category', 'match' => ['value' => $filter->category]];
        }

        if ($filter?->researchId !== null) {
            $must[] = ['key' => 'research_id', 'match' => ['value' => $filter->researchId]];
        }

        $range = array_filter([
            'gte' => $filter?->from,
            'lte' => $filter?->to,
        ], static fn (mixed $value): bool => $value !== null && $value !== '');

        if ($range !== []) {
            $must[] = ['key' => 'created_at', 'range' => $range];
        }

        return ['must' => $must];
    }

    private function pointId(string $projectId, KnowledgePoint $point): string
    {
        return $this->uuidV5(self::NAMESPACE_UUID, "{$projectId}|{$point->researchId}|{$point->sourceUrl}");
    }

    /** UUIDv5 без внешней зависимости: идентификатор точки обязан быть воспроизводимым. */
    private function uuidV5(string $namespace, string $name): string
    {
        $binaryNamespace = hex2bin(str_replace('-', '', $namespace));
        $hash = sha1((string) $binaryNamespace.$name);

        return sprintf(
            '%08s-%04s-%04x-%04x-%12s',
            substr($hash, 0, 8),
            substr($hash, 8, 4),
            (hexdec(substr($hash, 12, 4)) & 0x0FFF) | 0x5000,
            (hexdec(substr($hash, 16, 4)) & 0x3FFF) | 0x8000,
            substr($hash, 20, 12),
        );
    }

    private function collection(): string
    {
        return (string) $this->config->get('cms-research.qdrant.collection', 'knowledge');
    }

    private function client(): PendingRequest
    {
        $url = $this->config->get('cms-research.qdrant.url');

        if (! is_string($url) || $url === '') {
            throw ResearchConfigurationException::missingKnowledgeBaseUrl();
        }

        $request = $this->http
            ->baseUrl($url)
            ->timeout((int) $this->config->get('cms-research.qdrant.timeout', 15))
            ->acceptJson();

        $apiKey = $this->config->get('cms-research.qdrant.api_key');

        return is_string($apiKey) && $apiKey !== ''
            ? $request->withHeaders(['api-key' => $apiKey])
            : $request;
    }
}
