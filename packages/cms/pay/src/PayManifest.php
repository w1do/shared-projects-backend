<?php

declare(strict_types=1);

namespace Cms\Pay;

use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;

final class PayManifest
{
    public const VERSION = '0.1.0';

    public static function build(): ServiceManifest
    {
        return new ServiceManifest(
            key: 'pay',
            version: self::VERSION,
            permissions: [
                new PermissionDefinition('pay.plans.view', 'Просмотр планов', 'plans'),
                new PermissionDefinition('pay.plans.manage', 'Управление планами', 'plans'),
                new PermissionDefinition('pay.payments.view', 'Просмотр платежей', 'payments'),
                new PermissionDefinition('pay.payments.confirm', 'Подтверждение оплат', 'payments'),
                new PermissionDefinition('pay.payments.refund', 'Возвраты', 'payments'),
                new PermissionDefinition('pay.subscriptions.view', 'Просмотр подписок', 'subscriptions'),
                new PermissionDefinition('pay.subscriptions.manage', 'Управление подписками', 'subscriptions'),
            ],
            navigation: [
                new NavigationItem('pay.plans', 'nav.pay.plans', '/pay/plans', 'pay.plans.view', 'layers', 60),
                new NavigationItem('pay.payments', 'nav.pay.payments', '/pay/payments', 'pay.payments.view', 'credit-card', 61),
                new NavigationItem('pay.subscriptions', 'nav.pay.subscriptions', '/pay/subscriptions', 'pay.subscriptions.view', 'refresh-cw', 62),
            ],
            settings: [
                new SettingDefinition('default_currency', 'string', 'Валюта по умолчанию', 'RUB', ['string', 'size:3']),
                new SettingDefinition('provider_secret', 'string', 'Секрет провайдера', null, ['string'], secret: true),
            ],
        );
    }
}
