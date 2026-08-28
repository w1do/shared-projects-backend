<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Spatie\LaravelData\Data;

/**
 * Ответ activate/refresh (ТЗ 1.7): подписанный токен, серверная подсказка
 * состояния (`licensed`/`updates_expired`/`revoked`) и интервал refresh.
 */
final class ActivationResultDTO extends Data
{
    public function __construct(
        public string $token,
        public string $state,
        public int $refresh_in,
    ) {}
}
