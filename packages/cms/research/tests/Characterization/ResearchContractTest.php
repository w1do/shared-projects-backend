<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Contracts\SerpSearchClient;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchSource;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Research\Domain\ValueObjects\ImageResultItem;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Bus;

/**
 * Характеризационные снимки admin-контракта cms/research: ресёрч, темы и
 * сборка проекта — успешные ответы и достижимые ветки отказов.
 */
const RESEARCH_CONTRACT_PERMS = [
    'content.research.view', 'content.research.run',
    'content.topics.view', 'content.topics.manage',
    'auth.projects.view', 'auth.projects.manage',
];

function researchContractHeaders(array $permissions = RESEARCH_CONTRACT_PERMS): array
{
    return actingAsContentOperator('proj-1', $permissions);
}

/** Детерминированная фикстура: завершённое исследование с источником и темой. */
function seedResearchContractFixtures(): Research
{
    app(ProjectContext::class)->set('proj-1');

    $research = Research::create([
        'query' => 'Расскажи про топ 10 автомобилей',
        'engine' => 'yandex',
        'sub_queries_count' => 2,
        'results_per_sub_query' => 3,
        'status' => 'done',
        'progress_stage' => 'completed',
        'sub_queries' => ['седаны', 'кроссоверы'],
        'summary' => 'Сводный материал по автомобилям',
        'started_at' => now(),
        'completed_at' => now(),
    ]);

    ResearchSource::create([
        'research_id' => $research->getKey(),
        'sub_query' => 'седаны',
        'position' => 0,
        'url' => 'https://example.com/sedany',
        'title' => 'Обзор седанов',
        'content' => 'Текст про седаны',
    ]);

    ResearchTopic::create([
        'research_id' => $research->getKey(),
        'title' => 'Топ-10 седанов 2026 года',
        'rationale' => 'В источниках есть подборки',
        'suggested_category' => 'Седаны',
    ]);

    return $research;
}

beforeEach(function () {
    config()->set('cms-ai.api_key', 'test-key');
    config()->set('cms-research.serpapi.api_key', 'test-serp-key');
    Bus::fake();
});

test('contract: research index', function () {
    seedResearchContractFixtures();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/research', researchContractHeaders());

    ResponseSnapshot::assertMatches($response, 'research-index');
});

test('contract: research index filtered by status', function () {
    seedResearchContractFixtures();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/research?status=process', researchContractHeaders());

    ResponseSnapshot::assertMatches($response, 'research-index-status');
});

test('contract: research show with sources', function () {
    $research = seedResearchContractFixtures();

    $response = $this->getJson(
        "/api/admin/v1/projects/proj-1/content/research/{$research->getKey()}",
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'research-show');
});

test('contract: research store', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/research',
        ['query' => 'Расскажи про топ 10 автомобилей'],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'research-store');
});

test('contract: research store with an empty query', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/research',
        ['query' => ''],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'research-store-422');
});

test('contract: research store beyond the concurrency limit', function () {
    config()->set('cms-research.max_concurrent', 1);
    seedResearchContractFixtures();

    Research::create([
        'project_id' => 'proj-1', 'query' => 'идущее', 'engine' => 'yandex',
        'sub_queries_count' => 1, 'results_per_sub_query' => 1, 'status' => 'process',
    ]);

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/research',
        ['query' => 'ещё один запрос'],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'research-store-422-limit');
});

test('contract: research store rejected without the run permission', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/research',
        ['query' => 'Расскажи про топ 10 автомобилей'],
        researchContractHeaders(['content.research.view']),
    );

    ResponseSnapshot::assertMatches($response, 'research-store-403');
});

test('contract: research cancel', function () {
    $research = Research::create([
        'project_id' => 'proj-1', 'query' => 'идущее', 'engine' => 'yandex',
        'sub_queries_count' => 1, 'results_per_sub_query' => 1, 'status' => 'process',
    ]);

    $response = $this->postJson(
        "/api/admin/v1/projects/proj-1/content/research/{$research->getKey()}/cancel",
        [],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'research-cancel');
});

test('contract: research of another project is not found', function () {
    $research = seedResearchContractFixtures();

    $response = $this->getJson(
        "/api/admin/v1/projects/proj-2/content/research/{$research->getKey()}",
        actingAsContentOperator('proj-2', RESEARCH_CONTRACT_PERMS),
    );

    ResponseSnapshot::assertMatches($response, 'research-show-404-foreign');
});

test('contract: topics index', function () {
    $research = seedResearchContractFixtures();

    $response = $this->getJson(
        "/api/admin/v1/projects/proj-1/content/research/{$research->getKey()}/topics",
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'topics-index');
});

test('contract: topics extraction', function () {
    app(SystemInstructSeeder::class)->seed();
    $research = seedResearchContractFixtures();

    StructuredAgent::fake([['topics' => [
        ['title' => 'Кроссоверы против седанов', 'rationale' => 'Есть сравнения', 'category' => null],
    ]]]);

    $response = $this->postJson(
        "/api/admin/v1/projects/proj-1/content/research/{$research->getKey()}/topics",
        [],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'topics-store');
});

test('contract: topics extraction from an unfinished research', function () {
    app(SystemInstructSeeder::class)->seed();

    $research = Research::create([
        'project_id' => 'proj-1', 'query' => 'идущее', 'engine' => 'yandex',
        'sub_queries_count' => 1, 'results_per_sub_query' => 1, 'status' => 'process',
    ]);

    $response = $this->postJson(
        "/api/admin/v1/projects/proj-1/content/research/{$research->getKey()}/topics",
        [],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'topics-store-422');
});

test('contract: topic reject', function () {
    seedResearchContractFixtures();
    $topic = ResearchTopic::query()->firstOrFail();

    $response = $this->postJson(
        "/api/admin/v1/projects/proj-1/content/topics/{$topic->getKey()}/reject",
        [],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'topics-reject');
});

test('contract: buildout show when nothing ran yet', function () {
    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/buildout', researchContractHeaders());

    ResponseSnapshot::assertMatches($response, 'buildout-show-empty');
});

test('contract: buildout store', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/buildout',
        ['topic' => 'автомобили'],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'buildout-store');
});

test('contract: buildout store while another is running', function () {
    $this->postJson('/api/admin/v1/projects/proj-1/content/buildout', ['topic' => 'автомобили'], researchContractHeaders());

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/buildout',
        ['topic' => 'автомобили'],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'buildout-store-422-running');
});

test('contract: buildout store rejected without the manage permission', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/buildout',
        ['topic' => 'автомобили'],
        researchContractHeaders(['auth.projects.view']),
    );

    ResponseSnapshot::assertMatches($response, 'buildout-store-403');
});

test('contract: post generation start', function () {
    seedResearchContractFixtures();
    $topic = ResearchTopic::query()->firstOrFail();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/posts/generate',
        ['topic_id' => $topic->getKey()],
        researchContractHeaders(array_merge(RESEARCH_CONTRACT_PERMS, ['content.posts.manage'])),
    );

    ResponseSnapshot::assertMatches($response, 'posts-generate');
});

test('contract: post generation rejected without the posts permission', function () {
    seedResearchContractFixtures();
    $topic = ResearchTopic::query()->firstOrFail();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/posts/generate',
        ['topic_id' => $topic->getKey()],
        researchContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'posts-generate-403');
});

test('contract: post generation for a used topic', function () {
    seedResearchContractFixtures();
    $topic = ResearchTopic::query()->firstOrFail();
    $topic->update(['status' => 'used', 'post_id' => 1]);

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/posts/generate',
        ['topic_id' => $topic->getKey()],
        researchContractHeaders(array_merge(RESEARCH_CONTRACT_PERMS, ['content.posts.manage'])),
    );

    ResponseSnapshot::assertMatches($response, 'posts-generate-422-used');
});

test('contract: project topics index', function () {
    seedResearchContractFixtures();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/topics', researchContractHeaders());

    ResponseSnapshot::assertMatches($response, 'topics-index-project');
});

test('contract: content images search', function () {
    $client = new FakeSerpSearchClient;
    $client->images = [
        new ImageResultItem(
            link: 'https://cdn.test/car.jpg',
            thumbnail: 'https://cdn.test/car-thumb.jpg',
            width: 1200,
            height: 800,
            source: 'cdn.test',
        ),
        new ImageResultItem(link: 'https://cdn.test/plain.jpg'),
    ];
    app()->instance(SerpSearchClient::class, $client);

    ResponseSnapshot::assertMatches(
        $this->getJson(
            '/api/admin/v1/projects/proj-1/content/images/search?query=cars&limit=2',
            actingAsContentOperator('proj-1', ['content.media.manage']),
        ),
        'images-search',
    );
});

test('contract: content images search validation error', function () {
    app()->instance(SerpSearchClient::class, new FakeSerpSearchClient);

    ResponseSnapshot::assertMatches(
        $this->getJson(
            '/api/admin/v1/projects/proj-1/content/images/search?query=a&limit=99',
            actingAsContentOperator('proj-1', ['content.media.manage']),
        ),
        'images-search-422',
    );
});

test('contract: content images search when the service is unavailable', function () {
    $client = new FakeSerpSearchClient;
    $client->imageFailure = ResearchRuleViolation::imageSearchUnavailable();
    app()->instance(SerpSearchClient::class, $client);

    ResponseSnapshot::assertMatches(
        $this->getJson(
            '/api/admin/v1/projects/proj-1/content/images/search?query=cars',
            actingAsContentOperator('proj-1', ['content.media.manage']),
        ),
        'images-search-422-unavailable',
    );
});

test('contract: content images search forbidden', function () {
    app()->instance(SerpSearchClient::class, new FakeSerpSearchClient);

    ResponseSnapshot::assertMatches(
        $this->getJson(
            '/api/admin/v1/projects/proj-1/content/images/search?query=cars',
            actingAsContentOperator('proj-1', ['content.media.view']),
        ),
        'images-search-403',
    );
});
