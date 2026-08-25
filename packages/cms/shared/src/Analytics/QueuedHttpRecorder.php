<?php

declare(strict_types=1);

namespace Cms\Shared\Analytics;

use Cms\Contracts\Events\AnalyticsEvent;
use Illuminate\Contracts\Bus\Dispatcher;

/**
 * Отправка события в analytics-service асинхронной джобой с retry.
 * Недоступность аналитики не влияет на вызывающую операцию.
 */
final class QueuedHttpRecorder implements AnalyticsRecorder
{
    public function __construct(private readonly Dispatcher $bus) {}

    public function record(AnalyticsEvent $event): void
    {
        $this->bus->dispatch(new SendAnalyticsEventJob($event->toArray()));
    }
}
