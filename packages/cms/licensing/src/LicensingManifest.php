<?php

declare(strict_types=1);

namespace Cms\Licensing;

use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\ServiceManifest;

/**
 * Манифест сервиса licensing: версия и навигация консольного раздела.
 *
 * Права модуля (`pay.licensing.view|manage`) остаются объявленными в PayManifest
 * (Д2): имена сохраняются, роли и снимки не мигрируются. Auth-service не требует
 * совпадения префикса права с ключом манифеста — nav-пункт ссылается на право
 * из чужой группы свободно.
 */
final class LicensingManifest
{
    public const VERSION = '0.1.0';

    public static function build(): ServiceManifest
    {
        return new ServiceManifest(
            key: 'licensing',
            version: self::VERSION,
            navigation: [
                new NavigationItem('licensing', 'nav.licensing', '/licensing', 'pay.licensing.view', 'key-round', 63),
            ],
        );
    }
}
