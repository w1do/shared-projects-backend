<?php

declare(strict_types=1);

namespace Cms\Shared\Analytics;

use Cms\Contracts\Events\AnalyticsEvent;

/** Заглушка: аналитика выключена или недоступна — вызовы проходят без эффекта. */
final class NullRecorder implements AnalyticsRecorder
{
    public function record(AnalyticsEvent $event): void {}
}
