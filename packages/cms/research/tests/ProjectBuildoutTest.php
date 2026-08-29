<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Content\Domain\Models\Category;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\StartProjectBuildoutCommand;
use Cms\Research\Application\DTOs\Buildout\StartBuildoutDTO;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Handlers\StartProjectBuildoutHandler;
use Cms\Research\Domain\Enums\BuildoutStatus;
use Cms\Research\Domain\Models\ProjectBuildout;
use Cms\Research\Infrastructure\Jobs\BuildProjectJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

/** @param list<array{name: string, slug: string, parent_slug: ?string}> $categories */
function fakeBuildoutAi(array $categories, string $description = 'Автомобильный портал', string $topic = 'автомобили'): void
{
    StructuredAgent::fake([[
        'description' => $description,
        'topic' => $topic,
        'categories' => $categories,
    ]]);
}

function startBuildout(string $topic = 'автомобили', bool $overwrite = false): ProjectBuildout
{
    return app(StartProjectBuildoutHandler::class)->handle(new StartProjectBuildoutCommand(
        StartBuildoutDTO::fromValidated(['topic' => $topic, 'overwrite' => $overwrite]),
    ));
}

function runBuildoutJob(ProjectBuildout $buildout): void
{
    app()->call([new BuildProjectJob($buildout->project_id, (int) $buildout->getKey()), 'handle']);
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    app(SystemInstructSeeder::class)->seed();
    Http::fake(['*' => Http::response(['data' => ['accepted' => true]], 202)]);
});

test('buildout returns immediately and queues the job', function () {
    Bus::fake();

    $buildout = startBuildout();

    expect($buildout->status)->toBe(BuildoutStatus::Process);
    Bus::assertDispatched(BuildProjectJob::class);
});

test('a second buildout is refused while the first is running', function () {
    Bus::fake();
    startBuildout();

    try {
        startBuildout();
        $this->fail('expected ResearchRuleViolation');
    } catch (ResearchRuleViolation) {
        expect(ProjectBuildout::query()->count())->toBe(1);
    }
});

test('buildout fills the project and creates a nested category tree', function () {
    Bus::fake();
    fakeBuildoutAi([
        ['name' => 'Седаны', 'slug' => 'sedany', 'parent_slug' => null],
        ['name' => 'Бизнес-седаны', 'slug' => 'business-sedany', 'parent_slug' => 'sedany'],
        ['name' => 'Кроссоверы', 'slug' => 'crossovers', 'parent_slug' => null],
    ]);

    $buildout = startBuildout();
    runBuildoutJob($buildout);
    $buildout->refresh();

    $child = Category::query()->where('slug', 'business-sedany')->firstOrFail();
    $parent = Category::query()->where('slug', 'sedany')->firstOrFail();

    expect($buildout->status)->toBe(BuildoutStatus::Done)
        ->and($buildout->categories_created)->toBe(3)
        ->and($buildout->project_updated)->toBeTrue()
        ->and(Category::query()->count())->toBe(3)
        ->and($child->parent_id)->toBe($parent->getKey());

    Http::assertSent(fn ($request) => str_contains($request->url(), '/internal/project-profile')
        && $request->data()['description'] === 'Автомобильный портал'
        && $request->data()['topic'] === 'автомобили');
});

test('an existing category is kept as is instead of being duplicated', function () {
    Bus::fake();
    Category::create(['name' => ['en' => 'Седаны'], 'slug' => 'sedany']);

    fakeBuildoutAi([
        ['name' => 'Седаны заново', 'slug' => 'sedany', 'parent_slug' => null],
        ['name' => 'Кроссоверы', 'slug' => 'crossovers', 'parent_slug' => null],
    ]);

    $buildout = startBuildout();
    runBuildoutJob($buildout);

    expect(Category::query()->count())->toBe(2)
        ->and($buildout->fresh()?->categories_created)->toBe(1)
        ->and(Category::query()->where('slug', 'sedany')->first()?->name)->toBe('Седаны');
});

test('a response that does not match the schema fails the buildout without touching the project', function () {
    Bus::fake();
    StructuredAgent::fake([['unexpected' => 'shape']]);

    $buildout = startBuildout();

    try {
        runBuildoutJob($buildout);
        $this->fail('expected the AI response error to surface');
    } catch (Throwable) {
        // failed() вызывается очередью — здесь воспроизводим её поведение
        (new BuildProjectJob($buildout->project_id, (int) $buildout->getKey()))->failed(new RuntimeException('bad shape'));
    }

    expect($buildout->fresh()?->status)->toBe(BuildoutStatus::Failed)
        ->and(Category::query()->count())->toBe(0);

    Http::assertNothingSent();
});

test('a failure midway through the category list leaves no partial tree', function () {
    Bus::fake();
    fakeBuildoutAi([
        ['name' => 'Седаны', 'slug' => 'sedany', 'parent_slug' => null],
        // parent_slug ссылается на несуществующую категорию: вставка сорвётся
        ['name' => 'Сломанная', 'slug' => 'broken', 'parent_slug' => null],
    ]);

    $buildout = startBuildout();

    // Обрыв на середине: вторая категория падает на сохранении
    Category::saving(function (Category $category): void {
        if ($category->slug === 'broken') {
            throw new RuntimeException('storage failure');
        }
    });

    try {
        runBuildoutJob($buildout);
        $this->fail('expected the storage failure to surface');
    } catch (RuntimeException) {
        expect(Category::query()->count())->toBe(0);
    }

    Http::assertNothingSent();
});

test('repeating after a partial apply does not duplicate categories', function () {
    Bus::fake();

    $categories = [
        ['name' => 'Седаны', 'slug' => 'sedany', 'parent_slug' => null],
        ['name' => 'Кроссоверы', 'slug' => 'crossovers', 'parent_slug' => null],
    ];

    fakeBuildoutAi($categories);
    $buildout = startBuildout();
    runBuildoutJob($buildout);

    // Повтор той же сборки: категории уже есть, дубликаты не создаются
    fakeBuildoutAi($categories);
    ProjectBuildout::query()->whereKey($buildout->getKey())->update(['status' => BuildoutStatus::Process->value]);
    runBuildoutJob($buildout->fresh());

    expect(Category::query()->count())->toBe(2)
        ->and($buildout->fresh()?->categories_created)->toBe(0)
        ->and($buildout->fresh()?->project_updated)->toBeTrue();
});

test('buildout does not touch other projects', function () {
    Bus::fake();
    app(ProjectContext::class)->set('proj-2');
    Category::create(['name' => ['en' => 'Чужая'], 'slug' => 'foreign']);

    app(ProjectContext::class)->set('proj-1');
    fakeBuildoutAi([['name' => 'Седаны', 'slug' => 'sedany', 'parent_slug' => null]]);

    runBuildoutJob(startBuildout());

    app(ProjectContext::class)->set('proj-2');

    expect(Category::query()->count())->toBe(1)
        ->and(Category::query()->first()?->slug)->toBe('foreign');
});
