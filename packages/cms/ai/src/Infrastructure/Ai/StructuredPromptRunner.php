<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

use Cms\Ai\Application\Exceptions\AiException;
use Cms\Ai\Application\Exceptions\AiRequestException;
use Cms\Ai\Application\Exceptions\AiResponseException;
use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Ai\Infrastructure\Config\AiProviderConfig;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Responses\StructuredAgentResponse;
use Throwable;

/**
 * Единственное место, знающее про вызов SDK: конфигурация проверяется до сети,
 * отказы провайдера оборачиваются в исключения пакета без утечки ключа.
 */
final readonly class StructuredPromptRunner
{
    public function __construct(private AiProviderConfig $config) {}

    /**
     * @param  callable(JsonSchema): array<string, mixed>  $schema
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function run(string $instructions, callable $schema, array $payload): array
    {
        $this->config->ensureConfigured();

        $agent = new StructuredAgent($instructions, $schema);

        try {
            $response = $agent->prompt(
                json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                provider: AiProviderConfig::INSTANCE,
                model: $this->config->model,
                timeout: $this->config->timeout,
            );
        } catch (AiException $exception) {
            throw $exception;
        } catch (Throwable $error) {
            throw AiRequestException::wrap($error);
        }

        if (! $response instanceof StructuredAgentResponse) {
            throw new AiResponseException('AI provider returned an unstructured response.');
        }

        /** @var array<string, mixed> */
        return $response->structured;
    }
}
