<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Policies;

use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Billing\Subscriber;
use Illuminate\Database\Eloquent\Builder;

/**
 * Владение подпиской подписчиком — единственное место, где это правило
 * описано. Подписчик — полиморфная пара type+id (VO `Subscriber`).
 *
 * Правило применяется как УСЛОВИЕ ВЫБОРКИ (`ownedBy`), а не как проверка
 * после загрузки: чужая подписка обязана давать 404, а не 403 (Safety
 * Protocol, И11; снимок public-subscription-404-foreign). Регистрация в
 * `Gate` намеренно не вводится — `AuthorizationException` изменил бы код
 * ответа с 404 на 403.
 */
final class SubscriptionPolicy
{
    /**
     * Условие владения для lookup'а и списка.
     *
     * @param  Builder<Subscription>  $query
     * @return Builder<Subscription>
     */
    public function ownedBy(Builder $query, Subscriber $subscriber): Builder
    {
        return $query
            ->where('subscriber_type', $subscriber->type)
            ->where('subscriber_id', $subscriber->id);
    }

    /** То же правило как предикат — для проверок вне выборки. */
    public function owns(Subscription $subscription, Subscriber $subscriber): bool
    {
        return $subscription->subscriber()->is($subscriber);
    }
}
