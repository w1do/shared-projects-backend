<?php

declare(strict_types=1);

use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\BackgroundTaskState;
use Cms\Shared\BackgroundTasks\PruneFinishedTasksJob;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

// Реестр задач живёт в таблице: этому файлу нужна база, остальным тестам shared — нет.
uses(RefreshDatabase::class);

beforeEach(function () {
    app(ProjectContext::class)->set('project-a');
});

test('ход задачи пишется через порт и читается из таблицы', function () {
    $progress = app(TaskProgress::class);

    $taskId = $progress->queue(BackgroundTaskKind::PostGeneration, 'topic', '42', 'operator-1');

    $task = BackgroundTask::query()->findOrFail($taskId);
    expect($task->state)->toBe(BackgroundTaskState::Queued)
        ->and($task->project_id)->toBe('project-a')
        ->and($task->subject_type)->toBe('topic')
        ->and($task->subject_id)->toBe('42')
        ->and($task->initiated_by)->toBe('operator-1')
        ->and($task->queued_at)->not->toBeNull();

    $progress->start($taskId, 'preparing');
    $progress->stage($taskId, 'ai_request');
    $progress->succeed($taskId, '77');

    $task->refresh();
    expect($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->stage)->toBe('ai_request')
        ->and($task->subject_id)->toBe('77')
        ->and($task->started_at)->not->toBeNull()
        ->and($task->finished_at)->not->toBeNull();
});

test('завершённая задача не переписывается повторной доставкой', function () {
    $progress = app(TaskProgress::class);
    $taskId = $progress->queue(BackgroundTaskKind::Research);

    $progress->start($taskId);
    $progress->succeed($taskId);
    $progress->fail($taskId, new RuntimeException('поздний отказ'));

    $task = BackgroundTask::query()->findOrFail($taskId);
    expect($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->failure_reason)->toBeNull();
});

test('технические детали отказа наружу не уходят', function () {
    $progress = app(TaskProgress::class);
    $taskId = $progress->queue(BackgroundTaskKind::MediaImport);
    $progress->start($taskId);

    $progress->fail($taskId, new RuntimeException('SQLSTATE[42P01]: relation "posts" does not exist'));

    $task = BackgroundTask::query()->findOrFail($taskId);
    expect($task->state)->toBe(BackgroundTaskState::Failed)
        ->and($task->failure_reason)->not->toContain('RuntimeException')
        ->and($task->failure_reason)->not->toContain('SQLSTATE')
        ->and($task->failure_reason)->toBe('Задача не выполнена. Попробуйте запустить её ещё раз.');
});

test('доменное правило объясняет отказ своими словами', function () {
    $progress = app(TaskProgress::class);
    $taskId = $progress->queue(BackgroundTaskKind::PostGeneration);
    $progress->start($taskId);

    $progress->fail($taskId, ValidationException::withMessages([
        'topic' => ['Тема уже использована для другого поста.'],
    ]));

    $task = BackgroundTask::query()->findOrFail($taskId);
    expect($task->failure_reason)->toBe('Тема уже использована для другого поста.');
});

test('задача чужого проекта не видна в выборке', function () {
    $progress = app(TaskProgress::class);
    $ownId = $progress->queue(BackgroundTaskKind::Research);

    app(ProjectContext::class)->set('project-b');
    $foreignId = $progress->queue(BackgroundTaskKind::Research);

    app(ProjectContext::class)->set('project-a');
    expect(BackgroundTask::query()->find($foreignId))->toBeNull()
        ->and(BackgroundTask::query()->find($ownId))->not->toBeNull()
        ->and(BackgroundTask::query()->count())->toBe(1);
});

test('чистка убирает старые завершённые задачи и не трогает свежие', function () {
    $progress = app(TaskProgress::class);

    $old = $progress->queue(BackgroundTaskKind::Research);
    $progress->start($old);
    $progress->succeed($old);
    BackgroundTask::query()->whereKey($old)->update(['finished_at' => now()->subDays(3)]);

    $fresh = $progress->queue(BackgroundTaskKind::Research);
    $progress->start($fresh);
    $progress->succeed($fresh);

    $running = $progress->queue(BackgroundTaskKind::Research);
    $progress->start($running);

    (new PruneFinishedTasksJob)->handle();

    expect(BackgroundTask::query()->find($old))->toBeNull()
        ->and(BackgroundTask::query()->find($fresh))->not->toBeNull()
        ->and(BackgroundTask::query()->find($running))->not->toBeNull();
});
