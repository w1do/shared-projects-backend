<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Research\Application\Commands\CancelResearchCommand;
use Cms\Research\Application\Commands\StartResearchCommand;
use Cms\Research\Application\DTOs\Research\StartResearchDTO;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Handlers\CancelResearchHandler;
use Cms\Research\Application\Handlers\StartResearchHandler;
use Cms\Research\Application\Queries\GetResearchQuery;
use Cms\Research\Application\Queries\ListResearchesQuery;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\Contracts\PageContentFetcher;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Enums\ResearchProgressStage;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\ValueObjects\PageContent;
use Cms\Research\Infrastructure\Jobs\IndexResearchJob;
use Cms\Research\Infrastructure\Jobs\ProcessResearchJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Bus;

/** Ответы модели пайплайна: сначала подзапросы, затем сводный текст. */
function fakeResearchAi(array $subQueries = ['подзапрос'], string $summary = 'Сводный материал'): void
{
    StructuredAgent::fake([
        ['sub_queries' => $subQueries],
        ['summary' => $summary],
    ]);
}

function bindResearchSources(array $searchResults, array $pages): InMemoryKnowledgeBase
{
    app()->instance(SerpSearchClient::class, new FakeSerpSearchClient(fallback: $searchResults));
    app()->instance(PageContentFetcher::class, new FakePageContentFetcher($pages));

    $knowledge = new InMemoryKnowledgeBase;
    app()->instance(KnowledgeBase::class, $knowledge);

    return $knowledge;
}

function startResearch(string $query = 'Расскажи про топ 10 автомобилей'): Research
{
    return app(StartResearchHandler::class)->handle(new StartResearchCommand(
        StartResearchDTO::fromValidated(['query' => $query]),
    ));
}

function runResearchJob(Research $research): void
{
    app()->call([new ProcessResearchJob($research->project_id, (int) $research->getKey()), 'handle']);
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    config()->set('cms-research.serpapi.api_key', 'test-serp-key');
});

test('start returns immediately and queues the pipeline', function () {
    Bus::fake();

    $research = startResearch();

    expect($research->status)->toBe(ResearchStatus::Process)
        ->and($research->progress_stage)->toBe(ResearchProgressStage::Starting)
        ->and($research->summary)->toBeNull();

    Bus::assertDispatched(ProcessResearchJob::class);
});

test('defaults come from the project settings when not given', function () {
    Bus::fake();
    config()->set('cms-research.sub_queries_count', 7);
    config()->set('cms-research.results_per_sub_query', 2);
    config()->set('cms-research.engine', 'google');

    $research = startResearch();

    expect($research->sub_queries_count)->toBe(7)
        ->and($research->results_per_sub_query)->toBe(2)
        ->and($research->engine->value)->toBe('google');
});

test('start beyond the concurrency limit is refused and running researches keep going', function () {
    Bus::fake();
    config()->set('cms-research.max_concurrent', 1);

    $running = startResearch('первый запрос');

    try {
        startResearch('второй запрос');
        $this->fail('expected ResearchRuleViolation');
    } catch (ResearchRuleViolation) {
        expect(Research::query()->count())->toBe(1)
            ->and($running->fresh()?->status)->toBe(ResearchStatus::Process);
    }
});

test('pipeline collects sources, writes a summary and queues indexing', function () {
    Bus::fake([IndexResearchJob::class]);
    fakeResearchAi(['цены на седаны'], 'Сводка по седанам');

    bindResearchSources(
        fakeSerpResults([['https://example.com/a', 'Седаны'], ['https://example.com/b', 'Купе']]),
        [
            'https://example.com/a' => new PageContent('https://example.com/a', 'Текст про седаны', 'Седаны'),
            'https://example.com/b' => new PageContent('https://example.com/b', 'Текст про купе', 'Купе'),
        ],
    );

    $research = Research::create(['query' => 'автомобили', 'engine' => 'yandex', 'sub_queries_count' => 1, 'results_per_sub_query' => 5]);

    runResearchJob($research);
    $research->refresh();

    expect($research->status)->toBe(ResearchStatus::Done)
        ->and($research->progress_stage)->toBe(ResearchProgressStage::Completed)
        ->and($research->summary)->toBe('Сводка по седанам')
        ->and($research->sub_queries)->toBe(['цены на седаны'])
        ->and($research->sources()->count())->toBe(2)
        ->and($research->completed_at)->not->toBeNull();

    Bus::assertDispatched(IndexResearchJob::class);
});

test('unreachable sources are skipped and the research completes on the rest', function () {
    Bus::fake([IndexResearchJob::class]);
    fakeResearchAi();

    bindResearchSources(
        fakeSerpResults([['https://example.com/ok', 'Живая'], ['https://example.com/dead', 'Мёртвая']]),
        ['https://example.com/ok' => new PageContent('https://example.com/ok', 'Живой текст', 'Живая')],
    );

    $research = Research::create(['query' => 'автомобили', 'engine' => 'yandex', 'sub_queries_count' => 1, 'results_per_sub_query' => 5]);

    runResearchJob($research);
    $research->refresh();

    expect($research->status)->toBe(ResearchStatus::Done)
        ->and($research->sources()->count())->toBe(1)
        ->and($research->sources()->first()?->url)->toBe('https://example.com/ok');
});

test('research fails with a reason when no source can be fetched', function () {
    Bus::fake([IndexResearchJob::class]);
    fakeResearchAi();

    bindResearchSources(fakeSerpResults([['https://example.com/dead', 'Мёртвая']]), []);

    $research = Research::create(['query' => 'автомобили', 'engine' => 'yandex', 'sub_queries_count' => 1, 'results_per_sub_query' => 5]);

    runResearchJob($research);
    $research->refresh();

    expect($research->status)->toBe(ResearchStatus::Failed)
        ->and($research->error_message)->not->toBeNull()
        ->and($research->summary)->toBeNull();

    Bus::assertNotDispatched(IndexResearchJob::class);
});

test('cancelling during the run stops the pipeline at a stage boundary', function () {
    Bus::fake([IndexResearchJob::class]);
    fakeResearchAi();

    // Отмена происходит между разбивкой на подзапросы и поиском.
    $research = Research::create(['query' => 'автомобили', 'engine' => 'yandex', 'sub_queries_count' => 1, 'results_per_sub_query' => 5]);

    $search = new FakeSerpSearchClient(fallback: fakeSerpResults([['https://example.com/a', 'A']]));
    app()->instance(SerpSearchClient::class, $search);
    app()->instance(PageContentFetcher::class, new FakePageContentFetcher([
        'https://example.com/a' => new PageContent('https://example.com/a', 'Текст', 'A'),
    ]));

    Research::query()->whereKey($research->getKey())->update(['status' => ResearchStatus::Canceled->value]);

    runResearchJob($research);
    $research->refresh();

    expect($research->status)->toBe(ResearchStatus::Canceled)
        ->and($search->calls)->toBe(0)
        ->and($research->sources()->count())->toBe(0);
});

test('re-delivering a finished job changes nothing', function () {
    Bus::fake([IndexResearchJob::class]);
    fakeResearchAi();
    bindResearchSources(fakeSerpResults([['https://example.com/a', 'A']]), [
        'https://example.com/a' => new PageContent('https://example.com/a', 'Текст', 'A'),
    ]);

    $research = Research::create([
        'query' => 'автомобили', 'engine' => 'yandex', 'sub_queries_count' => 1, 'results_per_sub_query' => 5,
        'status' => ResearchStatus::Done, 'summary' => 'Готовая сводка',
    ]);

    runResearchJob($research);
    $research->refresh();

    expect($research->summary)->toBe('Готовая сводка')
        ->and($research->status)->toBe(ResearchStatus::Done)
        ->and($research->sources()->count())->toBe(0);
});

test('cancel is idempotent', function () {
    Bus::fake();
    $research = startResearch();

    $first = app(CancelResearchHandler::class)->handle(new CancelResearchCommand((int) $research->getKey()));
    $completedAt = $first->completed_at;

    $second = app(CancelResearchHandler::class)->handle(new CancelResearchCommand((int) $research->getKey()));

    expect($second->status)->toBe(ResearchStatus::Canceled)
        ->and($second->completed_at?->toIso8601String())->toBe($completedAt?->toIso8601String());
});

test('research of another project is invisible', function () {
    Bus::fake();
    $research = startResearch();

    app(ProjectContext::class)->set('proj-2');

    expect(app(ListResearchesQuery::class)->handle())->toBe([]);

    app(GetResearchQuery::class)->handle((int) $research->getKey());
})->throws(ModelNotFoundException::class);

test('list can be filtered by status', function () {
    Bus::fake();
    $first = startResearch('первый');
    config()->set('cms-research.max_concurrent', 0);
    startResearch('второй');

    app(CancelResearchHandler::class)->handle(new CancelResearchCommand((int) $first->getKey()));

    $canceled = app(ListResearchesQuery::class)->handle(ResearchStatus::Canceled->value);

    expect($canceled)->toHaveCount(1)
        ->and($canceled[0]->query)->toBe('первый');
});

test('re-delivery of a running job does not duplicate sources', function () {
    Bus::fake([IndexResearchJob::class]);

    $pages = [
        'https://example.com/a' => new PageContent('https://example.com/a', 'Текст A', 'A'),
        'https://example.com/b' => new PageContent('https://example.com/b', 'Текст B', 'B'),
    ];

    $research = Research::create(['query' => 'автомобили', 'engine' => 'yandex', 'sub_queries_count' => 1, 'results_per_sub_query' => 5]);

    // Первый прогон завершает исследование
    fakeResearchAi();
    bindResearchSources(fakeSerpResults([['https://example.com/a', 'A'], ['https://example.com/b', 'B']]), $pages);
    runResearchJob($research);

    expect($research->fresh()?->sources()->count())->toBe(2);

    // Повторная доставка на ещё не завершённом исследовании (гонка воркера):
    // источники не удваиваются — уникальность держит (research_id, url_hash)
    $research->forceFill(['status' => ResearchStatus::Process])->save();
    fakeResearchAi();
    bindResearchSources(fakeSerpResults([['https://example.com/a', 'A'], ['https://example.com/b', 'B']]), $pages);
    runResearchJob($research);

    expect($research->fresh()?->sources()->count())->toBe(2)
        ->and($research->fresh()?->sources()->pluck('url')->unique()->count())->toBe(2);
});
