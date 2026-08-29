<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Content\Domain\Models\Category;
use Cms\Instructs\Domain\Models\InstructUsage;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\ExtractTopicsCommand;
use Cms\Research\Application\Commands\RejectTopicCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Handlers\ExtractTopicsHandler;
use Cms\Research\Application\Handlers\RejectTopicHandler;
use Cms\Research\Application\Queries\ListTopicsQuery;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Shared\Tenant\ProjectContext;

function topicResearch(string $status = 'done'): Research
{
    $research = Research::create([
        'query' => 'Расскажи про топ 10 автомобилей',
        'engine' => 'yandex',
        'sub_queries_count' => 1,
        'results_per_sub_query' => 2,
        'status' => $status,
        'summary' => 'Сводка по автомобилям',
        'completed_at' => now(),
    ]);

    ResearchSource::create([
        'research_id' => $research->getKey(),
        'position' => 0,
        'url' => 'https://example.com/a',
        'title' => 'Обзор седанов',
        'content' => 'Текст про седаны и кроссоверы',
    ]);

    return $research;
}

/** @param list<array{title: string, rationale: string, category: ?string}> $topics */
function fakeTopicsAi(array $topics): void
{
    StructuredAgent::fake([['topics' => $topics]]);
}

function extractTopics(Research $research, ?int $maxCount = null): array
{
    return app(ExtractTopicsHandler::class)->handle(new ExtractTopicsCommand((int) $research->getKey(), $maxCount));
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    app(SystemInstructSeeder::class)->seed();
});

test('completed research turns into topics with a rationale and a category', function () {
    Category::create(['name' => ['en' => 'Седаны'], 'slug' => 'sedany']);

    fakeTopicsAi([
        ['title' => 'Топ-10 седанов 2026 года', 'rationale' => 'В источниках есть подборки', 'category' => 'Седаны'],
        ['title' => 'Кроссоверы против седанов', 'rationale' => 'Есть сравнения', 'category' => 'Кроссоверы'],
    ]);

    $topics = extractTopics(topicResearch());

    expect($topics)->toHaveCount(2)
        ->and($topics[0]->title)->toBe('Топ-10 седанов 2026 года')
        ->and($topics[0]->rationale)->toBe('В источниках есть подборки')
        ->and($topics[0]->category_id)->not->toBeNull()
        ->and($topics[0]->suggested_category)->toBeNull()
        // Подходящей категории нет — сохраняется предложенное название
        ->and($topics[1]->category_id)->toBeNull()
        ->and($topics[1]->suggested_category)->toBe('Кроссоверы')
        ->and(Category::query()->count())->toBe(1);
});

test('topics of an unfinished research are refused', function (string $status) {
    fakeTopicsAi([['title' => 'Тема', 'rationale' => 'x', 'category' => null]]);

    try {
        extractTopics(topicResearch($status));
        $this->fail('expected ResearchRuleViolation');
    } catch (ResearchRuleViolation) {
        expect(ResearchTopic::query()->count())->toBe(0);
    }
})->with(['process', 'failed', 'canceled']);

test('the applied instruct is snapshotted for the research', function () {
    fakeTopicsAi([['title' => 'Тема', 'rationale' => 'x', 'category' => null]]);

    $research = topicResearch();
    extractTopics($research);

    $usage = InstructUsage::query()->firstOrFail();

    expect($usage->category_snapshot->value)->toBe('post_topics')
        ->and((int) $usage->generated_id)->toBe((int) $research->getKey())
        ->and($usage->generated_type)->toBe(Research::class);
});

test('re-extracting adds only new topics and keeps used and rejected ones', function () {
    $research = topicResearch();

    fakeTopicsAi([
        ['title' => 'Первая тема', 'rationale' => 'a', 'category' => null],
        ['title' => 'Вторая тема', 'rationale' => 'b', 'category' => null],
    ]);
    $first = extractTopics($research);

    $first[0]->update(['status' => TopicStatus::Used, 'post_id' => 42]);
    app(RejectTopicHandler::class)->handle(new RejectTopicCommand((int) $first[1]->getKey()));

    fakeTopicsAi([
        ['title' => 'Первая тема', 'rationale' => 'дубль', 'category' => null],
        ['title' => 'Вторая тема', 'rationale' => 'дубль', 'category' => null],
        ['title' => 'Третья тема', 'rationale' => 'c', 'category' => null],
    ]);
    $second = extractTopics($research);

    expect($second)->toHaveCount(1)
        ->and($second[0]->title)->toBe('Третья тема')
        ->and(ResearchTopic::query()->count())->toBe(3)
        ->and($first[0]->fresh()?->status)->toBe(TopicStatus::Used)
        ->and($first[0]->fresh()?->post_id)->toBe(42)
        ->and($first[1]->fresh()?->status)->toBe(TopicStatus::Rejected);
});

test('rejecting a topic removes it from the suggested list but keeps it in history', function () {
    fakeTopicsAi([['title' => 'Тема', 'rationale' => 'x', 'category' => null]]);
    $topics = extractTopics(topicResearch());

    app(RejectTopicHandler::class)->handle(new RejectTopicCommand((int) $topics[0]->getKey()));

    $suggested = app(ListTopicsQuery::class)->handle(null, TopicStatus::Suggested->value);

    expect($suggested)->toBe([])
        ->and(app(ListTopicsQuery::class)->handle())->toHaveCount(1);
});

test('a used topic cannot be rejected', function () {
    fakeTopicsAi([['title' => 'Тема', 'rationale' => 'x', 'category' => null]]);
    $topics = extractTopics(topicResearch());
    $topics[0]->update(['status' => TopicStatus::Used, 'post_id' => 7]);

    app(RejectTopicHandler::class)->handle(new RejectTopicCommand((int) $topics[0]->getKey()));
})->throws(ResearchRuleViolation::class);

test('rejecting twice is idempotent', function () {
    fakeTopicsAi([['title' => 'Тема', 'rationale' => 'x', 'category' => null]]);
    $topics = extractTopics(topicResearch());

    app(RejectTopicHandler::class)->handle(new RejectTopicCommand((int) $topics[0]->getKey()));
    $second = app(RejectTopicHandler::class)->handle(new RejectTopicCommand((int) $topics[0]->getKey()));

    expect($second->status)->toBe(TopicStatus::Rejected);
});

test('topics are scoped to their project', function () {
    fakeTopicsAi([['title' => 'Тема', 'rationale' => 'x', 'category' => null]]);
    extractTopics(topicResearch());

    app(ProjectContext::class)->set('proj-2');

    expect(app(ListTopicsQuery::class)->handle())->toBe([]);
});
