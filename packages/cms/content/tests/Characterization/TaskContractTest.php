<?php

declare(strict_types=1);

use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/** Снимок выдачи фоновых задач проекта (routes/admin.php: GET content/tasks). */
function seedTasksForContract(string $projectId = 'proj-1'): void
{
    app(ProjectContext::class)->set($projectId);
    $progress = app(TaskProgress::class);

    $done = $progress->queue(BackgroundTaskKind::PostGeneration, 'topic', '7', 'operator-1');
    $progress->start($done, 'preparing');
    $progress->succeed($done, '42');

    $running = $progress->queue(BackgroundTaskKind::Research, 'research', '3', 'operator-1');
    $progress->start($running, 'searching');

    app(ProjectContext::class)->clear();
}

test('contract: content tasks index', function () {
    $headers = actingAsContentOperator(permissions: ['content.tasks.view']);
    seedTasksForContract();

    ResponseSnapshot::assertMatches(
        $this->get('/api/admin/v1/projects/proj-1/content/tasks', $headers),
        'tasks-index',
    );
});

test('contract: content tasks index empty', function () {
    $headers = actingAsContentOperator(permissions: ['content.tasks.view']);

    ResponseSnapshot::assertMatches(
        $this->get('/api/admin/v1/projects/proj-1/content/tasks', $headers),
        'tasks-index-empty',
    );
});

test('contract: content tasks index validation error', function () {
    $headers = actingAsContentOperator(permissions: ['content.tasks.view']);

    ResponseSnapshot::assertMatches(
        $this->get('/api/admin/v1/projects/proj-1/content/tasks?kind=unknown-kind', $headers),
        'tasks-index-422',
    );
});

test('оператор без права на задачи получает отказ', function () {
    $headers = actingAsContentOperator(permissions: ['content.posts.view']);

    $this->get('/api/admin/v1/projects/proj-1/content/tasks', $headers)->assertForbidden();
});

test('выполняющиеся задачи идут перед завершёнными', function () {
    $headers = actingAsContentOperator(permissions: ['content.tasks.view']);
    seedTasksForContract();

    $states = collect($this->get('/api/admin/v1/projects/proj-1/content/tasks', $headers)->json('data'))
        ->pluck('state')
        ->all();

    expect($states)->toBe(['running', 'succeeded']);
});

test('задача чужого проекта в выдачу не попадает', function () {
    $headers = actingAsContentOperator(permissions: ['content.tasks.view']);
    seedTasksForContract();

    $foreign = actingAsContentOperator('proj-2', ['content.tasks.view']);

    expect($this->get('/api/admin/v1/projects/proj-2/content/tasks', $foreign)->json('data'))->toBe([]);
});
