<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Config;

use Cms\Ai\Application\Exceptions\AiConfigurationException;

/**
 * Явная конфигурация AI-провайдера пакета.
 *
 * Заменяет передачу сырого массива `config('cms-ai')` и мутацию чужих записей
 * `ai.providers.*`: пакет объявляет СВОЙ экземпляр провайдера SDK (`cms-ai`),
 * дополняя значения выбранного драйвера собственными ключом и адресом.
 */
final readonly class AiProviderConfig
{
    /** Имя экземпляра провайдера laravel/ai, принадлежащего пакету. */
    public const INSTANCE = 'cms-ai';

    public function __construct(
        /** Драйвер SDK: openai, anthropic, … (CMS_AI_PROVIDER). */
        public string $driver,
        public ?string $apiKey,
        public string $baseUrl,
        public string $model,
        public int $timeout,
    ) {}

    /** @param array<string, mixed> $config значения cms-ai */
    public static function fromArray(array $config): self
    {
        return new self(
            driver: (string) ($config['provider'] ?? 'openai'),
            apiKey: isset($config['api_key']) ? (string) $config['api_key'] : null,
            baseUrl: (string) ($config['base_url'] ?? ''),
            model: (string) ($config['model'] ?? ''),
            timeout: (int) ($config['timeout'] ?? 30),
        );
    }

    /** Ключ проверяется до сети: отказ конфигурации не тратит запрос к провайдеру. */
    public function ensureConfigured(): void
    {
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new AiConfigurationException(
                'AI provider key is not configured. Set OPENAI_API_KEY in the environment.',
            );
        }
    }

    /**
     * Запись `ai.providers.cms-ai` для SDK: настройки драйвера + наши ключ и
     * адрес. Значения, доезжающие до SDK, те же, что и раньше, но чужая запись
     * `ai.providers.{driver}` остаётся нетронутой.
     *
     * @param  array<string, mixed>  $driverDefaults  текущая запись выбранного драйвера
     * @return array<string, mixed>
     */
    public function toProviderInstance(array $driverDefaults): array
    {
        return array_merge($driverDefaults, [
            'driver' => $this->driver,
            'key' => $this->apiKey,
            'url' => $this->baseUrl,
        ]);
    }
}
