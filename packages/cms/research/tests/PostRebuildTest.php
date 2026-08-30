<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\RebuildPostCommand;
use Cms\Research\Application\Handlers\RebuildPostHandler;
use Cms\Research\Application\Handlers\StartPostRebuildHandler;
use Cms\Research\Infrastructure\Jobs\RebuildPostJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\BackgroundTaskState;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Laravel\Ai\Embeddings;

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    Embeddings::fake();
    app(SystemInstructSeeder::class)->seed();
});

/** Пост проекта со своим адресом, категорией, тегами и обложкой. */
function rebuildablePost(array $headers): array
{
    $category = test()->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Авто', 'slug' => 'avto',
    ], $headers)->assertCreated()->json('data');

    return test()->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Старый заголовок',
        'slug' => 'staryj-zagolovok',
        'blocks' => [['title' => 'Часть', 'markdown' => 'Прежний текст поста.']],
        'categories' => [$category['id']],
        'tags' => ['седаны'],
    ], $headers)->assertCreated()->json('data');
}

test('задача пересборки видна в реестре задач проекта с предметом «пост»', function () {
    Bus::fake();
    $headers = actingAsContentOperator();
    $post = rebuildablePost($headers);

    app(StartPostRebuildHandler::class)->handle(
        new RebuildPostCommand((int) $post['id'], 'operator-7'),
    );

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->kind)->toBe(BackgroundTaskKind::PostRebuild)
        ->and($task->state)->toBe(BackgroundTaskState::Queued)
        ->and($task->subject_type)->toBe('post')
        ->and($task->subject_id)->toBe((string) $post['id'])
        ->and($task->initiated_by)->toBe('operator-7');

    Bus::assertDispatched(RebuildPostJob::class);
});

test('пересборка меняет заголовок, блоки и SEO, оставляя адрес и связи прежними', function () {
    $headers = actingAsContentOperator();
    $research = generationResearch();
    seedKnowledgeFor($research);
    $post = rebuildablePost($headers);

    fakePostAi();

    $rebuilt = app(RebuildPostHandler::class)->handle(new RebuildPostCommand((int) $post['id']));

    $rebuilt->load(['categories', 'tags', 'seo']);

    expect($rebuilt->title)->toBe('Топ-10 седанов 2026 года')
        ->and($rebuilt->blocks)->toHaveCount(10)
        ->and($rebuilt->seo?->description)->toBe('Подборка десяти седанов 2026 года')
        ->and($rebuilt->slug)->toBe('staryj-zagolovok')
        ->and($rebuilt->status->value)->toBe($post['status'])
        ->and($rebuilt->categories->pluck('id')->all())->toBe($post['categories'])
        ->and($rebuilt->tags->pluck('name')->all())->toBe(['седаны'])
        ->and($rebuilt->cover_media_id)->toBeNull()
        ->and($rebuilt->banner_media_id)->toBeNull();
});

test('прежнее содержимое остаётся версией в истории поста', function () {
    $headers = actingAsContentOperator();
    $research = generationResearch();
    seedKnowledgeFor($research);
    $post = rebuildablePost($headers);

    fakePostAi();
    app(RebuildPostHandler::class)->handle(new RebuildPostCommand((int) $post['id']));

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data');
    $previous = end($revisions);

    expect($previous['title'])->toBe('Старый заголовок');

    $restored = $this->postJson(
        "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$previous['id']}/restore",
        [],
        $headers,
    )->assertOk()->json('data');

    expect($restored['title'])->toBe('Старый заголовок')
        ->and($restored['body'])->toBe("## Часть\n\nПрежний текст поста.");
});

test('из ответа модели берутся первые десять блоков', function () {
    $headers = actingAsContentOperator();
    $research = generationResearch();
    seedKnowledgeFor($research);
    $post = rebuildablePost($headers);

    fakePostAi(blocks: fakePostBlocks(14));

    $rebuilt = app(RebuildPostHandler::class)->handle(new RebuildPostCommand((int) $post['id']));

    expect($rebuilt->blocks)->toHaveCount(10)
        ->and($rebuilt->blocks[9]['title'])->toBe('Часть 10');
});

test('отказ пересборки оставляет пост прежним, а задача отмечена причиной', function () {
    Bus::fake();
    $headers = actingAsContentOperator();
    $research = generationResearch();
    seedKnowledgeFor($research);
    $post = rebuildablePost($headers);

    // Модель вернула три блока вместо десяти: платформа такой текст не принимает
    fakePostAi(blocks: fakePostBlocks(3));

    $taskId = app(StartPostRebuildHandler::class)->handle(
        new RebuildPostCommand((int) $post['id'], 'operator-7'),
    )->id;

    $job = new RebuildPostJob('proj-1', (int) $post['id'], 'operator-7', $taskId);

    try {
        app()->call([$job, 'handle']);
    } catch (Throwable $error) {
        $job->failed($error);
    }

    $task = BackgroundTask::query()->findOrFail($taskId);
    $unchanged = Post::query()->findOrFail($post['id']);

    expect($task->state)->toBe(BackgroundTaskState::Failed)
        ->and($task->failure_reason)->toContain('content blocks')
        ->and($unchanged->title)->toBe('Старый заголовок')
        ->and($unchanged->blocks)->toHaveCount(1);
});

test('пересборку запускает только оператор с правом управления постами', function () {
    Bus::fake();
    $headers = actingAsContentOperator();
    $post = rebuildablePost($headers);

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/rebuild", [], $headers)
        ->assertStatus(202)
        ->assertJsonPath('data.kind', 'post_rebuild')
        ->assertJsonPath('data.subject_type', 'post');

    $readOnly = actingAsContentOperator(permissions: ['content.posts.view']);

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/rebuild", [], $readOnly)
        ->assertStatus(403);

    expect(BackgroundTask::query()->where('kind', BackgroundTaskKind::PostRebuild)->count())->toBe(1);
});
