<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

use Cms\Ai\Application\Exceptions\AiException;
use Cms\Ai\Application\Exceptions\AiRequestException;
use Cms\Ai\Application\Exceptions\AiResponseException;
use Cms\Ai\Infrastructure\Config\AiProviderConfig;
use Laravel\Ai\Embeddings;
use Throwable;

/**
 * Векторные представления через тот же экземпляр провайдера, что и остальные
 * операции пакета: второго канала к модели у платформы нет.
 */
final readonly class EmbeddingsRunner
{
    public function __construct(private AiProviderConfig $config) {}

    public function dimension(): int
    {
        return $this->config->embeddingDimension;
    }

    /**
     * @param  list<string>  $texts
     * @return list<list<float>>
     */
    public function run(array $texts): array
    {
        if ($texts === []) {
            return [];
        }

        $this->config->ensureConfigured();

        try {
            $response = Embeddings::for($texts)
                ->dimensions($this->config->embeddingDimension)
                ->timeout($this->config->timeout)
                ->generate(provider: AiProviderConfig::INSTANCE, model: $this->config->embeddingModel);
        } catch (AiException $exception) {
            throw $exception;
        } catch (Throwable $error) {
            throw AiRequestException::wrap($error);
        }

        $vectors = array_values($response->embeddings);

        if (count($vectors) !== count($texts)) {
            throw new AiResponseException('AI provider returned a different number of embeddings than requested.');
        }

        return array_map(
            static fn (array $vector): array => array_values(array_map('floatval', $vector)),
            $vectors,
        );
    }
}
