<?php

declare(strict_types=1);

namespace Cms\Shared\Analytics;

use Cms\Contracts\Events\AnalyticsEvent;

/** Порт записи аналитики. Сервисы шлют события только через него. */
interface AnalyticsRecorder
{
    public function record(AnalyticsEvent $event): void;
}
