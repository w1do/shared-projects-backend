<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Illuminate\Cache\RateLimiter;

/**
 * Ограничение частоты попыток входа и сброса пароля.
 *
 * Одна и та же тройка «проверить — засчитать — сбросить» была скопирована в
 * четырёх handlers, каждый со своими числами; здесь она одна, а параметры
 * остаются у вызывающего — они разные по смыслу (вход и сброс пароля).
 */
final class AttemptThrottle
{
    public function __construct(private readonly RateLimiter $limiter) {}

    /** @throws TooManyAttempts */
    public function ensureNotExceeded(string $key, int $maxAttempts): void
    {
        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            throw new TooManyAttempts;
        }
    }

    public function hit(string $key, int $decaySeconds): void
    {
        $this->limiter->hit($key, $decaySeconds);
    }

    public function clear(string $key): void
    {
        $this->limiter->clear($key);
    }
}
