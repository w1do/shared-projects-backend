<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/**
 * Тип API-ключа проекта.
 *
 * Публичный ключ уезжает в браузер сайта, поэтому по умолчанию умеет ровно одно —
 * присылать события; секретный — серверный и не ограничен скоупами.
 */
enum ApiKeyType: string
{
    case Public = 'public';
    case Secret = 'secret';

    /** Префикс ключа виден в логах и в панели — по нему тип узнаётся без БД. */
    public function prefix(): string
    {
        return match ($this) {
            self::Public => 'pk_live_',
            self::Secret => 'sk_live_',
        };
    }

    /** @return list<string> скоупы, если выдающий их не перечислил */
    public function defaultScopes(): array
    {
        return match ($this) {
            self::Public => ['collect'],
            self::Secret => ['*'],
        };
    }
}
