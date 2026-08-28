<?php

declare(strict_types=1);

use Cms\Contracts\Events\AnalyticsEvent;
use Cms\Shared\Analytics\Analytics;
use Cms\Shared\Analytics\AnalyticsRecorder;
use Cms\Shared\Tenant\ProjectContext;

/** Шпион-рекордер: копит события в памяти вместо отправки. */
final class SpyAnalyticsRecorder implements AnalyticsRecorder
{
    /** @var list<AnalyticsEvent> */
    public array $events = [];

    public function record(AnalyticsEvent $event): void
    {
        $this->events[] = $event;
    }
}

beforeEach(function () {
    $this->recorder = new SpyAnalyticsRecorder;
    app()->instance(AnalyticsRecorder::class, $this->recorder);
    Analytics::clearResolvedInstances();
});

test('legacy user subject key derives project id as before', function () {
    Analytics::push('user:proj-1:7', 'subscription.started');

    expect($this->recorder->events)->toHaveCount(1)
        ->and($this->recorder->events[0]->projectId)->toBe('proj-1')
        ->and($this->recorder->events[0]->subjectKey)->toBe('user:proj-1:7');
});

test('organization subject key derives project id from generalized template', function () {
    Analytics::push('organization:proj-2:42', 'subscription.started');

    expect($this->recorder->events)->toHaveCount(1)
        ->and($this->recorder->events[0]->projectId)->toBe('proj-2');
});

test('key outside template falls back to project context', function () {
    app(ProjectContext::class)->set('ctx-proj');

    Analytics::push('admin:5', 'settings.updated');

    expect($this->recorder->events)->toHaveCount(1)
        ->and($this->recorder->events[0]->projectId)->toBe('ctx-proj');
});

test('key outside template without context records nothing', function () {
    app(ProjectContext::class)->clear();

    Analytics::push('anon:abc', 'page.viewed');

    expect($this->recorder->events)->toBe([]);
});
