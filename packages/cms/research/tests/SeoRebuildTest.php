<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Instructs\Infrastructure\Persistence\InstructProjectScope;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\RebuildSeoCommand;
use Cms\Research\Application\Handlers\RebuildSeoHandler;
use Cms\Research\Application\Handlers\StartSeoRebuildHandler;
use Cms\Research\Infrastructure\Jobs\RebuildSeoJob;
use Cms\Shared\BackgroundTasks\BackgroundTask;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Cms\Shared\BackgroundTasks\BackgroundTaskState;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Illuminate\Validation\ValidationException;
use Laravel\Ai\Embeddings;

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    Embeddings::fake();
    app(SystemInstructSeeder::class)->seed();
});

/** Ответ модели с текстовыми SEO-полями. */
function fakeSeoAi(int $times = 1): void
{
    StructuredAgent::fake(array_fill(0, $times, [
        'title' => 'Новый заголовок',
        'description' => 'Новое описание',
        'keywords' => 'ключ, слово',
        'og_title' => 'OG заголовок',
        'og_description' => 'OG описание',
        'twitter_card' => 'summary',
    ]));
}

/** Убирает предустановленную инструкцию категории: пересборка категорий начнёт отказывать. */
function dropSystemInstruct(InstructCategory $category): void
{
    Instruct::withoutGlobalScope(InstructProjectScope::class)
        ->where('is_system', true)
        ->where('category', $category)
        ->delete();
}

test('задача пересборки SEO заводится на проект и видна в реестре', function () {
    Bus::fake();
    $headers = actingAsContentOperator();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Пост'], $headers)->assertCreated();

    app(StartSeoRebuildHandler::class)->handle(new RebuildSeoCommand(authorId: 'operator-7'));

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->kind)->toBe(BackgroundTaskKind::SeoRebuild)
        ->and($task->state)->toBe(BackgroundTaskState::Queued)
        ->and($task->subject_type)->toBe('project')
        ->and($task->subject_id)->toBe('proj-1')
        ->and($task->initiated_by)->toBe('operator-7');

    Bus::assertDispatched(RebuildSeoJob::class);
});

test('вторая пересборка проекта отклоняется, пока идёт первая', function () {
    Bus::fake();
    actingAsContentOperator();

    app(StartSeoRebuildHandler::class)->handle(new RebuildSeoCommand);

    expect(fn () => app(StartSeoRebuildHandler::class)->handle(new RebuildSeoCommand))
        ->toThrow(ValidationException::class);

    expect(BackgroundTask::query()->count())->toBe(1);
});

test('пересборка заполняет текстовые поля и не трогает поля оператора', function () {
    $headers = actingAsContentOperator();
    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Пост'], $headers)
        ->assertCreated()->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/post/{$post['id']}", [
        'title' => 'Старый заголовок',
        'canonical' => 'https://site.test/post',
        'robots' => 'noindex',
        'og_image' => 'https://site.test/og.png',
        'json_ld' => ['@type' => 'Article'],
    ], $headers)->assertOk();

    fakeSeoAi();

    $result = app(RebuildSeoHandler::class)->handle(new RebuildSeoCommand([
        ['type' => 'post', 'id' => (int) $post['id']],
    ]));

    $seo = Post::query()->findOrFail($post['id'])->seo;

    expect($result->processed)->toBe(1)
        ->and($result->hasFailures())->toBeFalse()
        ->and($seo?->title)->toBe('Новый заголовок')
        ->and($seo?->description)->toBe('Новое описание')
        ->and($seo?->keywords)->toBe('ключ, слово')
        ->and($seo?->og_title)->toBe('OG заголовок')
        ->and($seo?->og_description)->toBe('OG описание')
        ->and($seo?->twitter_card)->toBe('summary')
        ->and($seo?->canonical)->toBe('https://site.test/post')
        ->and($seo?->robots)->toBe('noindex')
        ->and($seo?->og_image)->toBe('https://site.test/og.png')
        ->and($seo?->json_ld)->toBe(['@type' => 'Article']);
});

test('без списка сущностей пересобирается весь проект', function () {
    $headers = actingAsContentOperator();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Пост'], $headers)->assertCreated();
    $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Авто'], $headers)->assertCreated();

    fakeSeoAi(times: 2);

    $result = app(RebuildSeoHandler::class)->handle(new RebuildSeoCommand);

    expect($result->processed)->toBe(2)
        ->and($result->total)->toBe(2)
        ->and(Category::query()->firstOrFail()->seo?->title)->toBe('Новый заголовок');
});

test('отказ по одной сущности сохраняет её поля и не роняет остальные', function () {
    $headers = actingAsContentOperator();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Пост'], $headers)->assertCreated();
    $category = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', ['name' => 'Авто'], $headers)
        ->assertCreated()->json('data');

    $this->putJson("/api/admin/v1/projects/proj-1/content/seo/category/{$category['id']}", [
        'title' => 'Заголовок категории',
    ], $headers)->assertOk();

    dropSystemInstruct(InstructCategory::CategorySeo);
    fakeSeoAi();

    $taskId = app(TaskProgress::class)
        ->queue(BackgroundTaskKind::SeoRebuild, 'project', 'proj-1');

    app()->call([new RebuildSeoJob('proj-1', [], $taskId), 'handle']);

    $task = BackgroundTask::query()->findOrFail($taskId);

    expect($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->stage)->toBe('1/2')
        ->and($task->failure_reason)->not->toBeNull()
        ->and(Post::query()->firstOrFail()->seo?->title)->toBe('Новый заголовок')
        ->and(Category::query()->findOrFail($category['id'])->seo?->title)->toBe('Заголовок категории');
});

test('пересборка без единой обработанной сущности закрывает задачу отказом', function () {
    $headers = actingAsContentOperator();
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', ['title' => 'Пост'], $headers)->assertCreated();

    dropSystemInstruct(InstructCategory::PostSeo);

    $taskId = app(TaskProgress::class)
        ->queue(BackgroundTaskKind::SeoRebuild, 'project', 'proj-1');

    $job = new RebuildSeoJob('proj-1', [], $taskId);

    try {
        app()->call([$job, 'handle']);
    } catch (Throwable $error) {
        $job->failed($error);
    }

    $task = BackgroundTask::query()->findOrFail($taskId);

    expect($task->state)->toBe(BackgroundTaskState::Failed)
        ->and($task->failure_reason)->not->toBeNull();
});

test('запуск пересборки закрыт правом content.seo.manage', function () {
    Bus::fake();

    $this->postJson('/api/admin/v1/projects/proj-1/content/seo/rebuild', [], actingAsContentOperator(permissions: ['content.posts.view']))
        ->assertForbidden();

    $this->postJson('/api/admin/v1/projects/proj-1/content/seo/rebuild', [
        'entities' => [['type' => 'post', 'id' => 1]],
    ], actingAsContentOperator())
        ->assertStatus(202)
        ->assertJsonPath('data.kind', 'seo_rebuild');
});
