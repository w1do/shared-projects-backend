<?php

declare(strict_types=1);

namespace Cms\Contracts\Localization;

/** Ключи локализации сервиса pay: навигация манифеста и карточка сервиса. */
enum PayLocalizationKeys: string implements LocalizationKeys
{
    use EnumeratesKeys;

    case NavPlans = 'nav.pay.plans';
    case NavPayments = 'nav.pay.payments';
    case NavSubscriptions = 'nav.pay.subscriptions';
    case ServiceTitle = 'service.pay.title';
    case ServiceDescription = 'service.pay.description';

    public static function service(): string
    {
        return 'pay';
    }

    public static function locale(): string
    {
        return 'ru';
    }

    public function defaultValue(): string
    {
        return match ($this) {
            self::NavPlans => 'Планы',
            self::NavPayments => 'Платежи',
            self::NavSubscriptions => 'Подписки',
            self::ServiceTitle => 'Платежи',
            self::ServiceDescription => 'Тарифы, платежи и подписки',
        };
    }
}
