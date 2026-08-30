<?php

declare(strict_types=1);

namespace Cms\Licensing;

use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\ServiceManifest;

/**
 * Манифест сервиса licensing: версия и навигация консольных разделов.
 *
 * Права модуля (`pay.licensing.view|manage`) остаются объявленными в PayManifest
 * (Д2): имена сохраняются, роли и снимки не мигрируются. Auth-service не требует
 * совпадения префикса права с ключом манифеста — nav-пункт ссылается на право
 * из чужой группы свободно. Навигация отдаётся при включённом сервисе `pay`:
 * собственного переключателя у лицензирования нет.
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
                new NavigationItem('license-plans', 'nav.license-plans', '/licensing/plans', 'pay.licensing.view', 'layers', 63),
                new NavigationItem('licenses', 'nav.licenses', '/licensing/licenses', 'pay.licensing.view', 'key-round', 64),
                new NavigationItem('organizations', 'nav.organizations', '/licensing/organizations', 'pay.licensing.view', 'building-2', 65),
                new NavigationItem('releases', 'nav.releases', '/licensing/releases', 'pay.licensing.view', 'package', 66),
            ],
        );
    }
}
