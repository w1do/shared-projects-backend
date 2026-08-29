<?php

declare(strict_types=1);

namespace Cms\Research\Application\Exceptions;

use RuntimeException;

/** Обязательная настройка отсутствует: отказ до обращения к сети, ключ в сообщение не попадает. */
final class ResearchConfigurationException extends RuntimeException
{
    public static function missingSearchKey(): self
    {
        return new self('Search provider key is not configured. Set SERPAPI_KEY in the environment.');
    }

    public static function missingKnowledgeBaseUrl(): self
    {
        return new self('Knowledge base address is not configured. Set QDRANT_URL in the environment.');
    }
}
