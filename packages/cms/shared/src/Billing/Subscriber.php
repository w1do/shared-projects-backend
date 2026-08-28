<?php

declare(strict_types=1);

namespace Cms\Shared\Billing;

use InvalidArgumentException;

/**
 * Полиморфный подписчик: пара type + id. Тип не обязан иметь локальную
 * Eloquent-модель — пользователь сайта (`site_user`) живёт в БД auth-service,
 * поэтому подписчик — идентичность, а не морф-связь.
 */
final readonly class Subscriber
{
    public const SITE_USER = 'site_user';

    public function __construct(
        public string $type,
        public string $id,
    ) {
        if ($this->type === '' || $this->id === '') {
            throw new InvalidArgumentException('Subscriber type and id must not be empty.');
        }
    }

    public static function siteUser(string $userId): self
    {
        return new self(self::SITE_USER, $userId);
    }

    /**
     * Субъект-ключ аналитики. Для site_user — прежний формат `user:{project}:{id}`
     * байт-в-байт (непрерывность истории ClickHouse и склейка с событиями auth),
     * для остальных типов — `{type}:{project}:{id}`.
     */
    public function subjectKey(string $projectId): string
    {
        $segment = $this->type === self::SITE_USER ? 'user' : $this->type;

        return "{$segment}:{$projectId}:{$this->id}";
    }

    public function is(self $other): bool
    {
        return $this->type === $other->type && $this->id === $other->id;
    }
}
