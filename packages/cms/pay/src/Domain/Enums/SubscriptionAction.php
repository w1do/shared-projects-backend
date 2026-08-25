<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Enums;

/**
 * Действие над подпиской.
 *
 * Множества оператора и пользователя сайта РАЗНЫЕ и не объединяются
 * (Safety Protocol, И2): `delete` доступен только оператору, единый набор
 * открыл бы пользователю сайта удаление подписки.
 *
 * Ограничение admin-маршрута выражено `->whereIn(...)` на маршруте, а не
 * FormRequest'ом: route-параметр не попадает в `$request->all()` (И7).
 * На публичном маршруте `whereIn` НЕ ставится — там неизвестное действие
 * обязано давать 422 `action: Unknown action.`, а не 404 (снимок
 * public-subscription-422-action).
 */
enum SubscriptionAction: string
{
    case Cancel = 'cancel';
    case Resume = 'resume';
    case Pause = 'pause';
    case Delete = 'delete';

    /** @return list<self> */
    public static function adminActions(): array
    {
        return [self::Cancel, self::Resume, self::Pause, self::Delete];
    }

    /** @return list<self> */
    public static function siteActions(): array
    {
        return [self::Cancel, self::Resume, self::Pause];
    }

    /** @return list<string> */
    public static function adminValues(): array
    {
        return array_map(static fn (self $action): string => $action->value, self::adminActions());
    }

    /** Действие, допустимое пользователю сайта; иначе null. */
    public static function forSite(string $action): ?self
    {
        $case = self::tryFrom($action);

        return $case !== null && in_array($case, self::siteActions(), true) ? $case : null;
    }
}
