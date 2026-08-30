<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\ProjectCity;
use Cms\Content\Domain\Models\Region;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\AdaptCitySeoCommand;
use Cms\Research\Application\Handlers\StartCitySeoAdaptationHandler;
use Cms\Research\Domain\Models\ProjectBuildout;
use Cms\Research\Infrastructure\Jobs\AdaptCitySeoJob;
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

/** Города справочника; включённость проекта задаётся отдельно. */
function adaptationCities(int $count = 2): void
{
    $region = Region::query()->create(['name' => 'Республика Татарстан', 'federal_district' => 'Приволжский']);

    foreach (range(1, $count) as $index) {
        City::query()->create([
            'region_id' => $region->id,
            'name' => 'Город '.$index,
            'slug' => 'city-'.$index,
            'population' => 1000000 - $index,
        ]);
    }
}

function enableAdaptationCity(string $projectId, City $city): void
{
    ProjectCity::query()->create(['project_id' => $projectId, 'city_id' => $city->id, 'enabled' => true]);
}

/** Ответ модели с текстовыми SEO-полями города. */
function fakeCitySeoAi(int $times = 1): void
{
    StructuredAgent::fake(array_fill(0, $times, [
        'title' => 'Бензин в городе',
        'description' => 'Доставка топлива',
        'keywords' => 'бензин, доставка',
        'og_title' => 'OG заголовок',
        'og_description' => 'OG описание',
        'twitter_card' => 'summary',
    ]));
}

test('задача адаптации заводится на проект и видна в реестре', function () {
    Bus::fake();
    adaptationCities();

    app(StartCitySeoAdaptationHandler::class)->handle(new AdaptCitySeoCommand('доставка бензина', 'operator-7'));

    $task = BackgroundTask::query()->latest('id')->firstOrFail();

    expect($task->kind)->toBe(BackgroundTaskKind::CitySeoAdaptation)
        ->and($task->state)->toBe(BackgroundTaskState::Queued)
        ->and($task->subject_type)->toBe('project')
        ->and($task->subject_id)->toBe('proj-1')
        ->and($task->initiated_by)->toBe('operator-7');

    Bus::assertDispatched(AdaptCitySeoJob::class);
});

test('без тематики проекта и без переопределения запуск отклоняется', function () {
    Bus::fake();

    expect(fn () => app(StartCitySeoAdaptationHandler::class)->handle(new AdaptCitySeoCommand))
        ->toThrow(ValidationException::class);

    expect(BackgroundTask::query()->count())->toBe(0);
    Bus::assertNothingDispatched();
});

test('без переопределения берётся тематика проекта', function () {
    Bus::fake();
    ProjectBuildout::query()->create(['project_id' => 'proj-1', 'topic' => 'автопомощь на дорогах', 'status' => 'done']);

    app(StartCitySeoAdaptationHandler::class)->handle(new AdaptCitySeoCommand);

    Bus::assertDispatched(AdaptCitySeoJob::class, fn (AdaptCitySeoJob $job): bool => $job->topic === 'автопомощь на дорогах');
});

test('вторая адаптация отклоняется, пока идёт первая', function () {
    Bus::fake();

    app(StartCitySeoAdaptationHandler::class)->handle(new AdaptCitySeoCommand('доставка бензина'));

    expect(fn () => app(StartCitySeoAdaptationHandler::class)->handle(new AdaptCitySeoCommand('доставка бензина')))
        ->toThrow(ValidationException::class);

    expect(BackgroundTask::query()->count())->toBe(1);
});

test('запуск закрыт правом управления городами', function () {
    Bus::fake();
    ProjectBuildout::query()->create(['project_id' => 'proj-1', 'topic' => 'доставка бензина', 'status' => 'done']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/cities/adapt-seo', [],
        actingAsContentOperator(permissions: ['content.cities.view']))->assertForbidden();

    $this->postJson('/api/admin/v1/projects/proj-1/content/cities/adapt-seo', ['topic' => 'доставка бензина'],
        actingAsContentOperator(permissions: ['content.cities.view', 'content.cities.manage']))->assertStatus(202);
});

test('адаптация заполняет SEO включённых городов и не трогает выключенные', function () {
    adaptationCities();
    $enabled = City::query()->where('slug', 'city-1')->firstOrFail();
    $disabled = City::query()->where('slug', 'city-2')->firstOrFail();
    enableAdaptationCity('proj-1', $enabled);

    fakeCitySeoAi();

    $taskId = app(TaskProgress::class)->queue(BackgroundTaskKind::CitySeoAdaptation, 'project', 'proj-1');
    app()->call([new AdaptCitySeoJob('proj-1', 'доставка бензина', $taskId), 'handle']);

    $task = BackgroundTask::query()->findOrFail($taskId);

    expect($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->stage)->toBe('1/1')
        ->and(City::query()->findOrFail($enabled->id)->seo?->title)->toBe('Бензин в городе')
        ->and(City::query()->findOrFail($disabled->id)->seo)->toBeNull();
});

test('отказ модели по городу сохраняет его SEO и не останавливает задачу', function () {
    adaptationCities();
    $first = City::query()->where('slug', 'city-1')->firstOrFail();
    $second = City::query()->where('slug', 'city-2')->firstOrFail();
    enableAdaptationCity('proj-1', $first);
    enableAdaptationCity('proj-1', $second);

    $this->putJson("/api/admin/v1/projects/proj-1/content/cities/{$second->id}/seo", [
        'title' => 'Заголовок оператора',
    ], actingAsContentOperator())->assertOk();

    // Модель отвечает по второму городу без обязательных полей — это отказ.
    StructuredAgent::fake(fn (string $prompt): array => str_contains($prompt, 'Город 2')
        ? ['description' => 'ответ без обязательных полей']
        : [
            'title' => 'Бензин в городе',
            'description' => 'Доставка топлива',
            'keywords' => 'бензин, доставка',
            'og_title' => 'OG заголовок',
            'og_description' => 'OG описание',
            'twitter_card' => 'summary',
        ]);

    $taskId = app(TaskProgress::class)->queue(BackgroundTaskKind::CitySeoAdaptation, 'project', 'proj-1');
    app()->call([new AdaptCitySeoJob('proj-1', 'доставка бензина', $taskId), 'handle']);

    $task = BackgroundTask::query()->findOrFail($taskId);

    expect($task->state)->toBe(BackgroundTaskState::Succeeded)
        ->and($task->stage)->toBe('1/2')
        ->and($task->failure_reason)->not->toBeNull()
        ->and(City::query()->findOrFail($first->id)->seo?->title)->toBe('Бензин в городе')
        ->and(City::query()->findOrFail($second->id)->seo?->title)->toBe('Заголовок оператора');
});
