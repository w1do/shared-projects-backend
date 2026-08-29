<?php

declare(strict_types=1);

use Cms\Research\Application\Queries\SearchKnowledgeQuery;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\Enums\ResearchStatus;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgePoint;
use Cms\Research\Infrastructure\Jobs\IndexResearchJob;
use Cms\Research\Infrastructure\Persistence\QdrantKnowledgeBase;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Embeddings;

function knowledgeResearch(string $status = 'done'): Research
{
    $research = Research::create([
        'query' => 'Расскажи про топ 10 автомобилей',
        'engine' => 'yandex',
        'sub_queries_count' => 1,
        'results_per_sub_query' => 2,
        'status' => $status,
        'summary' => 'Сводка',
        'completed_at' => now(),
    ]);

    ResearchSource::create([
        'research_id' => $research->getKey(),
        'sub_query' => 'седаны',
        'position' => 0,
        'url' => 'https://example.com/a',
        'title' => 'Обзор седанов',
        'content' => 'Текст про седаны',
    ]);

    return $research;
}

function runIndexJob(Research $research): void
{
    app()->call([new IndexResearchJob($research->project_id, (int) $research->getKey()), 'handle']);
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    Embeddings::fake();
});

test('completed research is indexed with all required metadata', function () {
    $knowledge = new InMemoryKnowledgeBase;
    app()->instance(KnowledgeBase::class, $knowledge);

    $research = knowledgeResearch();
    runIndexJob($research);

    $points = array_values($knowledge->points['proj-1'] ?? []);

    expect($points)->toHaveCount(1)
        ->and($points[0]->topic)->toBe('Обзор седанов')
        ->and($points[0]->query)->toBe('Расскажи про топ 10 автомобилей')
        ->and($points[0]->content)->toBe('Текст про седаны')
        ->and($points[0]->category)->toBe('Расскажи про топ 10 автомобилей')
        ->and($points[0]->createdAt)->not->toBe('')
        ->and($points[0]->missingMetadata())->toBe([])
        ->and($research->fresh()?->sources()->first()?->indexed_at)->not->toBeNull();
});

test('failed and canceled researches are not indexed', function (string $status) {
    $knowledge = new InMemoryKnowledgeBase;
    app()->instance(KnowledgeBase::class, $knowledge);

    runIndexJob(knowledgeResearch($status));

    expect($knowledge->points)->toBe([]);
})->with([ResearchStatus::Failed->value, ResearchStatus::Canceled->value, ResearchStatus::Process->value]);

test('storage failure keeps the research result and leaves the sources unindexed', function () {
    $knowledge = new InMemoryKnowledgeBase;
    $knowledge->failWith = 'qdrant is down';
    app()->instance(KnowledgeBase::class, $knowledge);

    $research = knowledgeResearch();

    try {
        runIndexJob($research);
        $this->fail('expected the storage failure to surface for a retry');
    } catch (RuntimeException) {
        $research->refresh();

        expect($research->status)->toBe(ResearchStatus::Done)
            ->and($research->summary)->toBe('Сводка')
            ->and($research->sources()->first()?->indexed_at)->toBeNull();
    }
});

test('re-running indexing does not write the same source twice', function () {
    $knowledge = new InMemoryKnowledgeBase;
    app()->instance(KnowledgeBase::class, $knowledge);

    $research = knowledgeResearch();
    runIndexJob($research);
    runIndexJob($research);

    expect($knowledge->points['proj-1'])->toHaveCount(1);
});

test('a point missing required metadata is not stored and the reason is logged', function () {
    Log::spy();

    Http::fake(['*' => Http::response(['result' => []])]);
    $knowledge = app(QdrantKnowledgeBase::class);

    $written = $knowledge->upsert('proj-1', [new KnowledgePoint(
        topic: 'Тема',
        query: 'Запрос',
        content: 'Контент',
        category: '',
        createdAt: '2026-08-29T00:00:00+00:00',
        vector: [0.1],
        researchId: 1,
        sourceUrl: 'https://example.com/a',
    )]);

    expect($written)->toBe(0);
    Http::assertNothingSent();
    Log::shouldHaveReceived('warning')->once();
});

test('qdrant search always filters by the project and repeats yield the same point id', function () {
    Http::fake([
        '*/points/search' => Http::response(['result' => [[
            'score' => 0.9,
            'payload' => [
                'topic' => 'Тема', 'query' => 'Запрос', 'content' => 'Контент',
                'category' => 'Категория', 'created_at' => '2026-08-29T00:00:00+00:00',
                'research_id' => 7, 'source_url' => 'https://example.com/a',
            ],
        ]]]),
        '*' => Http::response(['result' => true]),
    ]);

    $knowledge = app(QdrantKnowledgeBase::class);

    $point = new KnowledgePoint(
        topic: 'Тема', query: 'Запрос', content: 'Контент', category: 'Категория',
        createdAt: '2026-08-29T00:00:00+00:00', vector: [0.1, 0.2],
        researchId: 7, sourceUrl: 'https://example.com/a',
    );

    $knowledge->upsert('proj-1', [$point]);
    $knowledge->upsert('proj-1', [$point]);

    $ids = [];
    Http::assertSent(function ($request) use (&$ids) {
        if (str_contains($request->url(), '/points?wait=true')) {
            $ids[] = $request->data()['points'][0]['id'];
        }

        return true;
    });

    expect($ids)->toHaveCount(2)->and($ids[0])->toBe($ids[1]);

    $hits = $knowledge->search('proj-1', [0.1, 0.2], 5, new KnowledgeFilter(category: 'Категория'));

    expect($hits)->toHaveCount(1)->and($hits[0]->topic)->toBe('Тема');

    Http::assertSent(function ($request) {
        if (! str_contains($request->url(), '/points/search')) {
            return true;
        }

        $must = $request->data()['filter']['must'];

        return $must[0] === ['key' => 'project_id', 'match' => ['value' => 'proj-1']];
    });
});

test('search does not cross projects and empty results are not an error', function () {
    $knowledge = new InMemoryKnowledgeBase;
    app()->instance(KnowledgeBase::class, $knowledge);

    runIndexJob(knowledgeResearch());

    app(ProjectContext::class)->set('proj-2');

    expect(app(SearchKnowledgeQuery::class)->handle('седаны'))->toBe([]);

    app(ProjectContext::class)->set('proj-1');

    expect(app(SearchKnowledgeQuery::class)->handle('седаны'))->toHaveCount(1);
});

test('provision creates the collection once and is safe to repeat', function () {
    $calls = ['get' => 0, 'put' => 0];

    Http::fake(function ($request) use (&$calls) {
        if ($request->method() === 'GET') {
            $calls['get']++;

            return Http::response([], $calls['get'] === 1 ? 404 : 200);
        }

        $calls['put']++;

        return Http::response(['result' => true]);
    });

    app(QdrantKnowledgeBase::class)->provision();
    app(QdrantKnowledgeBase::class)->provision();

    // Первый прогон создаёт коллекцию и индекс, второй — ничего не пишет.
    expect($calls['put'])->toBe(2);
});
