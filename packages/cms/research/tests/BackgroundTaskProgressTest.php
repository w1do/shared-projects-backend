<?php

declare(strict_types=1);

use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\Commands\StartProjectBuildoutCommand;
use Cms\Research\Application\DTOs\Buildout\StartBuildoutDTO;
use Cms\Research\Application\Handlers\StartPostGenerationHandler;
use Cms\Research\Application\Handlers\StartProjectBuildoutHandler;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Research\Infrastructure\Jobs\GeneratePostJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\BackgroundTaskState;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Laravel\Ai\Embeddings;

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    Embeddings::fake();
    app(SystemInstructSeeder::class)->seed();
});

test('задача заводится до постановки в очередь и видна как принятая', function () {
    Bus::fake();
    $research = generationResearch();
    $topic = topicFor($research);

    app(StartPostGenerationHandler::class)->handle(
        new GeneratePostCommand((int) $topic->getKey(), 'operator-7'),
    );

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->kind)->toBe(BackgroundTaskKind::PostGeneration)
        ->and($task->state)->toBe(BackgroundTaskState::Queued)
        ->and($task->subject_type)->toBe('topic')
        ->and($task->subject_id)->toBe((string) $topic->getKey())
        ->and($task->initiated_by)->toBe('operator-7')
        ->and($task->queued_at)->not->toBeNull()
        ->and($task->started_at)->toBeNull();

    Bus::assertDispatched(GeneratePostJob::class);
});

test('написание поста проходит этапы и завершается ссылкой на пост', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);
    fakePostAi();

    $taskId = runGenerationThroughQueue($topic);

    $task = BackgroundTask::query()->findOrFail($taskId);

    expect($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->stage)->toBe('saving')
        ->and($task->subject_id)->not->toBeNull()
        ->and($task->started_at)->not->toBeNull()
        ->and($task->finished_at)->not->toBeNull();
});

test('отказ генерации закрывает задачу причиной, а не тишиной', function () {
    $research = generationResearch();
    $topic = topicFor($research);
    fakePostAi();

    // База знаний пуста — доменное правило отклоняет генерацию.
    $job = new GeneratePostJob('proj-1', (int) $topic->getKey(), null, queuedTaskId($topic));

    try {
        app()->call([$job, 'handle']);
    } catch (Throwable $error) {
        $job->failed($error);
    }

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->state)->toBe(BackgroundTaskState::Failed)
        ->and($task->failure_reason)->not->toBeNull()
        ->and($task->failure_reason)->not->toContain('Exception');
});

test('завершённое исследование не оставляет задачу в работе', function () {
    $research = Research::create([
        'query' => 'автомобили',
        'engine' => 'yandex',
        'sub_queries_count' => 1,
        'results_per_sub_query' => 2,
    ]);

    $progress = app(TaskProgress::class);
    $taskId = $progress->queue(BackgroundTaskKind::Research, 'research', (string) $research->getKey());
    $progress->start($taskId, 'starting');
    $progress->succeed($taskId);

    expect(BackgroundTask::query()->findOrFail($taskId)->state)->toBe(BackgroundTaskState::Succeeded);
});

test('сборка проекта заводит задачу с предметом-сборкой', function () {
    Bus::fake();

    $buildout = app(StartProjectBuildoutHandler::class)->handle(
        new StartProjectBuildoutCommand(StartBuildoutDTO::from(['topic' => 'Автомобили']), 'operator-1'),
    );

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->kind)->toBe(BackgroundTaskKind::ProjectBuildout)
        ->and($task->state)->toBe(BackgroundTaskState::Queued)
        ->and($task->subject_type)->toBe('buildout')
        ->and($task->subject_id)->toBe((string) $buildout->getKey());
});

/** Прогон генерации так, как её выполнит воркер: с записью реестра из handler'а. */
function runGenerationThroughQueue(ResearchTopic $topic): int
{
    $taskId = queuedTaskId($topic);

    app()->call([new GeneratePostJob('proj-1', (int) $topic->getKey(), null, $taskId), 'handle']);

    return $taskId;
}

function queuedTaskId(ResearchTopic $topic): int
{
    return app(TaskProgress::class)->queue(
        BackgroundTaskKind::PostGeneration,
        'topic',
        (string) $topic->getKey(),
    );
}
