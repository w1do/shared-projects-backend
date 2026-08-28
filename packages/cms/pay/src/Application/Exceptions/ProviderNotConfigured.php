<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/**
 * Провайдер не настроен либо неактивен (Д4): нет записи настроек с
 * credentials или запись архивирована — платежи через него не инициируются.
 */
final class ProviderNotConfigured extends DomainRuleViolation
{
    public static function make(string $provider): self
    {
        return self::withMessages([
            'provider' => ["Payment provider [{$provider}] is not configured or inactive."],
        ]);
    }
}
