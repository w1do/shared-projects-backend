<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\ValueObjects;

use Stringable;

/**
 * Ключ арендатора — субъект подписок и платежей сайта.
 * Формат `user:{projectId}:{userId}` — контракт хранения (`subscriptions.user_key`,
 * `payments.user_key`), он же субъект истории в аналитике.
 */
final readonly class SiteUserKey implements Stringable
{
    public function __construct(public string $value) {}

    /** Ключ из introspection: отсутствующий/пустой токен ключа не даёт. */
    public static function tryFrom(?string $value): ?self
    {
        return is_string($value) && $value !== '' ? new self($value) : null;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
