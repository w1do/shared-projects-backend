<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\Exceptions\SubscriberNotFound;
use Cms\Shared\Billing\Subscriber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * Подписчик для admin-оформления (Д16): `site_user` — внешний тип без
 * локальной модели (id не проверяется), локальные типы (организация) обязаны
 * существовать в текущем проекте (глобальный скоуп `BelongsToProject`),
 * неизвестный тип отклоняется.
 */
final class FindSubscriberQuery
{
    public function handle(string $subscriberType, string $subscriberId): Subscriber
    {
        if ($subscriberType === Subscriber::SITE_USER) {
            return Subscriber::siteUser($subscriberId);
        }

        $class = Relation::getMorphedModel($subscriberType);
        if ($class === null || ! is_subclass_of($class, Model::class)) {
            throw SubscriberNotFound::make();
        }

        if (! $class::query()->whereKey($subscriberId)->exists()) {
            throw SubscriberNotFound::make();
        }

        return new Subscriber($subscriberType, $subscriberId);
    }
}
