<?php

declare(strict_types=1);

use Cms\Contracts\Localization\AnalyticsLocalizationKeys;
use Cms\Contracts\Localization\ContentLocalizationKeys;
use Cms\Contracts\Localization\PayLocalizationKeys;

return [
    /*
     * Enum-реестры ключей локализации (Cms\Contracts\Localization\LocalizationKeys).
     * Живут в cms/contracts: у каждого сервиса своя БД, и только так один
     * localize:sync в content-service видит ключи всех сервисов.
     */
    'registries' => [
        ContentLocalizationKeys::class,
        AnalyticsLocalizationKeys::class,
        PayLocalizationKeys::class,
    ],
];
