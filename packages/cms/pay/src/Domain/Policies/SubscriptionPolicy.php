<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Policies;

use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Domain\ValueObjects\SiteUserKey;
use Illuminate\Database\Eloquent\Builder;

/**
 * Владение подпиской пользователем сайта — единственное место, где это
 * правило описано.
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
    public function ownedBy(Builder $query, SiteUserKey $userKey): Builder
    {
        return $query->where('user_key', $userKey->value);
    }

    /** То же правило как предикат — для проверок вне выборки. */
    public function owns(Subscription $subscription, SiteUserKey $userKey): bool
    {
        return $subscription->user_key === $userKey->value;
    }
}
