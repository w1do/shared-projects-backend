<?php

declare(strict_types=1);

use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Content\Application\Commands\DeletePostCommand;
use Cms\Content\Application\Handlers\DeletePostHandler;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Domain\Models\InstructUsage;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Handlers\GeneratePostFromTopicHandler;
use Cms\Research\Application\Handlers\StartPostGenerationHandler;
use Cms\Research\Domain\Contracts\KnowledgeBase;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\Research;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Research\Domain\ValueObjects\KnowledgePoint;
use Cms\Research\Infrastructure\Jobs\GeneratePostJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;
use Laravel\Ai\Embeddings;

/**
 * Блоки ответа модели: платформа требует не меньше десяти блоков и 8000
 * символов текста, поэтому каждый блок фикстуры заведомо длинный.
 */
function fakePostBlocks(int $count = 10, int $length = 900): array
{
    return array_map(
        static fn (int $index): array => [
            'title' => "Часть {$index}",
            'markdown' => "Текст части {$index}. ".str_repeat('Подробности материала. ', (int) ceil($length / 23)),
        ],
        range(1, $count),
    );
}

/** Ответы модели: сначала текст поста, затем SEO-поля. */
function fakePostAi(array $tags = ['седаны', 'обзор'], ?array $blocks = null): void
{
    StructuredAgent::fake([
        [
            'title' => 'Топ-10 седанов 2026 года',
            'slug' => 'top-10-sedanov-2026',
            'blocks' => $blocks ?? fakePostBlocks(),
            'tags' => $tags,
        ],
        [
            'title' => 'Топ-10 седанов 2026',
            'description' => 'Подборка десяти седанов 2026 года',
            'keywords' => 'седаны, автомобили, 2026',
        ],
    ]);
}

function seedKnowledgeFor(Research $research, string $category = 'Расскажи про топ 10 автомобилей'): InMemoryKnowledgeBase
{
    $knowledge = new InMemoryKnowledgeBase;
    app()->instance(KnowledgeBase::class, $knowledge);

    $knowledge->upsert('proj-1', [new KnowledgePoint(
        topic: 'Обзор седанов',
        query: $research->query,
        content: 'Подробный текст про седаны',
        category: $category,
        createdAt: '2026-08-29T00:00:00+00:00',
        vector: [0.1, 0.2],
        researchId: (int) $research->getKey(),
        sourceUrl: 'https://example.com/a',
        sourceTitle: 'Обзор седанов',
    )]);

    return $knowledge;
}

function topicFor(Research $research, array $attributes = []): ResearchTopic
{
    return ResearchTopic::create(array_merge([
        'research_id' => $research->getKey(),
        'title' => 'Топ-10 седанов 2026 года',
        'rationale' => 'В источниках есть подборки',
        'suggested_category' => 'Седаны',
    ], $attributes));
}

function generationResearch(): Research
{
    return Research::create([
        'query' => 'Расскажи про топ 10 автомобилей',
        'engine' => 'yandex',
        'sub_queries_count' => 1,
        'results_per_sub_query' => 2,
        'status' => 'done',
        'summary' => 'Сводка',
        'completed_at' => now(),
    ]);
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    config()->set('cms-ai.api_key', 'test-key');
    Embeddings::fake();
    app(SystemInstructSeeder::class)->seed();
});

test('a draft post is generated from the topic material', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();

    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect($post->title)->toBe('Топ-10 седанов 2026 года')
        ->and($post->slug)->toBe('top-10-sedanov-2026')
        ->and($post->blocks)->toHaveCount(10)
        ->and($post->blocks[0]['title'])->toBe('Часть 1')
        ->and($post->blocks[0]['markdown'])->toStartWith('Текст части 1.')
        ->and($post->blocks[0]['id'])->toMatch('/^[0-9A-HJKMNP-TV-Z]{26}$/')
        // Единый текст собран из блоков: заголовок второго уровня + текст
        ->and($post->body)->toStartWith("## Часть 1\n\nТекст части 1.")
        ->and(mb_strlen((string) $post->body))->toBeGreaterThanOrEqual(8000)
        ->and($post->status)->toBe(ContentStatus::Draft);
});

test('a topic pointing at a deleted category is rebound instead of failing', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    // Тема была привязана к категории, а оператор её удалил — ссылка мёртвая
    $category = new Category;
    $category->setTranslation('name', 'ru', 'Удалённая');
    $category->slug = 'udalennaya';
    $category->saveAsRoot();
    $deletedId = (int) $category->getKey();
    $topic->forceFill(['category_id' => $deletedId])->save();
    $category->delete();

    fakePostAi();

    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect($post->categories()->count())->toBe(1)
        ->and($post->categories()->first()->id)->not->toBe($deletedId)
        ->and($topic->fresh()->category_id)->toBe($post->categories()->first()->id);
});

test('generation is refused when the content is shorter than the required length', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    // Блоков достаточно, но текст короткий — это пересказ, а не статья
    fakePostAi(blocks: fakePostBlocks(10, 10));

    expect(fn () => app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey())))
        ->toThrow(ResearchRuleViolation::class);

    expect($topic->fresh()->status)->toBe(TopicStatus::Suggested)
        ->and(Post::acrossProjects()->count())->toBe(0);
});

test('generation is refused when the model returns fewer than ten blocks', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi(blocks: fakePostBlocks(3));

    expect(fn () => app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey())))
        ->toThrow(ResearchRuleViolation::class);

    // Тема осталась доступной для повторной попытки, пост не создан
    expect($topic->fresh()->status)->toBe(TopicStatus::Suggested)
        ->and(Post::acrossProjects()->count())->toBe(0);
});

test('the generated post gets categories, tags and seo', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();

    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));
    $post->load(['categories', 'tags', 'seo']);

    expect($post->categories)->toHaveCount(1)
        ->and($post->categories->first()?->name)->toBe('Седаны')
        ->and($post->tags->pluck('name')->all())->toEqualCanonicalizing(['седаны', 'обзор'])
        ->and($post->seo?->title)->toBe('Топ-10 седанов 2026')
        ->and($post->seo?->description)->toBe('Подборка десяти седанов 2026 года')
        ->and($post->seo?->keywords)->toBe('седаны, автомобили, 2026');
});

test('a suggested category missing from the project is created', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();

    expect(Category::query()->count())->toBe(0);

    app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect(Category::query()->count())->toBe(1)
        ->and(Category::query()->first()?->slug)->toBe('sedany')
        ->and($topic->fresh()?->category_id)->not->toBeNull();
});

test('an existing project category is reused', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $existing = Category::create(['name' => ['en' => 'Седаны'], 'slug' => 'sedany']);
    $topic = topicFor($research, ['category_id' => $existing->getKey(), 'suggested_category' => null]);

    fakePostAi();

    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect(Category::query()->count())->toBe(1)
        ->and($post->categories()->first()?->getKey())->toBe($existing->getKey());
});

test('generation is refused when the knowledge base has no material for the topic', function () {
    $research = generationResearch();
    app()->instance(KnowledgeBase::class, new InMemoryKnowledgeBase);
    $topic = topicFor($research);

    fakePostAi();

    try {
        app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));
        $this->fail('expected ResearchRuleViolation');
    } catch (ResearchRuleViolation) {
        expect(Post::query()->count())->toBe(0)
            ->and($topic->fresh()?->status)->toBe(TopicStatus::Suggested);
    }
});

test('the topic becomes used and points at the created post', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();

    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect($topic->fresh()?->status)->toBe(TopicStatus::Used)
        ->and($topic->fresh()?->post_id)->toBe($post->getKey());
});

test('a used topic cannot be generated again', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research, ['status' => TopicStatus::Used, 'post_id' => 5]);

    app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));
})->throws(ResearchRuleViolation::class);

test('a rejected topic cannot be generated', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research, ['status' => TopicStatus::Rejected]);

    app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));
})->throws(ResearchRuleViolation::class);

test('the applied instruct is snapshotted on the created post', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();

    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    $usage = InstructUsage::query()->where('generated_type', Post::class)->firstOrFail();

    expect((int) $usage->generated_id)->toBe((int) $post->getKey())
        ->and($usage->category_snapshot->value)->toBe('post_body');
});

test('re-delivering the job does not create a second post', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();
    app()->call([new GeneratePostJob('proj-1', (int) $topic->getKey()), 'handle']);

    fakePostAi();
    app()->call([new GeneratePostJob('proj-1', (int) $topic->getKey()), 'handle']);

    expect(Post::query()->count())->toBe(1);
});

test('start queues the generation and keeps the topic available until it runs', function () {
    Bus::fake();
    $research = generationResearch();
    $topic = topicFor($research);

    app(StartPostGenerationHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect($topic->fresh()?->status)->toBe(TopicStatus::Suggested);
    Bus::assertDispatched(GeneratePostJob::class);
});

test('a failed generation leaves the topic available for another attempt', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    StructuredAgent::fake([fn (): never => throw new RuntimeException('provider down')]);

    try {
        app()->call([new GeneratePostJob('proj-1', (int) $topic->getKey()), 'handle']);
        $this->fail('expected the provider failure to surface');
    } catch (Throwable) {
        expect(Post::query()->count())->toBe(0)
            ->and($topic->fresh()?->status)->toBe(TopicStatus::Suggested);
    }
});

test('deleting the post releases its topic back to suggested', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $topic = topicFor($research);

    fakePostAi();
    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    expect($topic->fresh()?->status)->toBe(TopicStatus::Used)
        ->and($topic->fresh()?->post_id)->toBe($post->getKey());

    app(DeletePostHandler::class)->handle(new DeletePostCommand($post));

    expect($topic->fresh()?->status)->toBe(TopicStatus::Suggested)
        ->and($topic->fresh()?->post_id)->toBeNull()
        ->and(Post::query()->count())->toBe(0);
});

test('deleting a post does not touch topics of other posts', function () {
    $research = generationResearch();
    seedKnowledgeFor($research);
    $kept = topicFor($research, ['title' => 'Тема с постом', 'status' => TopicStatus::Used, 'post_id' => 999]);
    $topic = topicFor($research, ['title' => 'Тема под удаление']);

    fakePostAi();
    $post = app(GeneratePostFromTopicHandler::class)->handle(new GeneratePostCommand((int) $topic->getKey()));

    app(DeletePostHandler::class)->handle(new DeletePostCommand($post));

    expect($kept->fresh()?->status)->toBe(TopicStatus::Used)
        ->and($kept->fresh()?->post_id)->toBe(999);
});
