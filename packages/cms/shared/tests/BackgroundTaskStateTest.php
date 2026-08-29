<?php

declare(strict_types=1);

use Cms\Shared\BackgroundTasks\BackgroundTaskState;

test('принятая задача уходит в работу или сразу в конечное состояние', function () {
    $queued = BackgroundTaskState::Queued;

    expect($queued->canTransitionTo(BackgroundTaskState::Running))->toBeTrue()
        ->and($queued->canTransitionTo(BackgroundTaskState::Failed))->toBeTrue()
        ->and($queued->canTransitionTo(BackgroundTaskState::Queued))->toBeFalse()
        ->and($queued->isFinal())->toBeFalse();
});

test('выполняющаяся задача не возвращается в очередь', function () {
    $running = BackgroundTaskState::Running;

    expect($running->canTransitionTo(BackgroundTaskState::Succeeded))->toBeTrue()
        ->and($running->canTransitionTo(BackgroundTaskState::Queued))->toBeFalse();
});

test('из конечного состояния переходов нет', function () {
    foreach ([BackgroundTaskState::Succeeded, BackgroundTaskState::Failed] as $final) {
        expect($final->isFinal())->toBeTrue();

        foreach (BackgroundTaskState::cases() as $target) {
            expect($final->canTransitionTo($target))->toBeFalse();
        }
    }
});
