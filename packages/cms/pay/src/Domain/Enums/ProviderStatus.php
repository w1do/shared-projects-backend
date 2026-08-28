<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Enums;

/** Жизненный цикл настроек провайдера: архив хранит данные, но платежи не принимает. */
enum ProviderStatus: string
{
    case Active = 'active';
    case Archived = 'archived';

    public function isActive(): bool
    {
        return $this === self::Active;
    }
}
