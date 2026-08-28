<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

/** Ключ провайдера отсутствует в реестре шлюзов. */
final class UnknownPaymentProvider extends DomainRuleViolation
{
    public static function make(string $provider): self
    {
        // Текст повторяет исторический ответ ProviderRegistry::for() —
        // контракт снимков не меняется.
        return self::withMessages(['provider' => ["Unknown payment provider [{$provider}]."]]);
    }
}
