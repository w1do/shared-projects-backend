<?php

declare(strict_types=1);

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Embed\EmbedRequestDTO;
use Cms\Ai\Application\DTOs\ExtractTopics\ExtractTopicsRequestDTO;
use Cms\Ai\Application\DTOs\GeneratePost\GeneratePostRequestDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeRequestDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteRequestDTO;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\SuggestCategoriesRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Ai\Application\Exceptions\AiConfigurationException;
use Cms\Ai\Application\Exceptions\AiRequestException;
use Cms\Ai\Application\Exceptions\AiResponseException;
use Cms\Ai\Application\Exceptions\AiSchemaException;
use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Cms\Ai\Infrastructure\Config\AiProviderConfig;
use Laravel\Ai\Embeddings;

beforeEach(function () {
    config()->set('cms-ai.api_key', 'test-key');
});

/** Массив в фейке SDK превращается в структурный ответ. */
function fakeAi(array|Closure $response): void
{
    StructuredAgent::fake([$response]);
}

test('rewrite maps structured response to dto', function () {
    fakeAi(['text' => 'Отредактировано.']);

    $result = app(AiOperations::class)->rewrite(new RewriteRequestDTO(text: 'Черновик', instruction: 'короче'));

    expect($result->text)->toBe('Отредактировано.');
});

test('normalize maps structured response to dto', function () {
    fakeAi(['text' => 'Нормализовано.']);

    $result = app(AiOperations::class)->normalize(new NormalizeRequestDTO(text: ' сырой  текст '));

    expect($result->text)->toBe('Нормализовано.');
});

test('translate returns every requested locale for every key', function () {
    fakeAi(['items' => [
        ['key' => 'title', 'locale' => 'en', 'value' => 'Categories'],
        ['key' => 'title', 'locale' => 'ru', 'value' => 'Категории'],
    ]]);

    $result = app(AiOperations::class)->translate(new TranslateRequestDTO(
        texts: ['title' => 'Categories'],
        targetLocales: ['en', 'ru'],
    ));

    expect($result->translations)->toBe(['title' => ['en' => 'Categories', 'ru' => 'Категории']]);
});

test('translate with missing locale is a response error, not raw data', function () {
    fakeAi(['items' => [
        ['key' => 'title', 'locale' => 'en', 'value' => 'Categories'],
    ]]);

    app(AiOperations::class)->translate(new TranslateRequestDTO(
        texts: ['title' => 'Categories'],
        targetLocales: ['en', 'ru'],
    ));
})->throws(AiResponseException::class);

test('suggest categories builds a tree from flat parent_slug rows', function () {
    fakeAi(['categories' => [
        ['name' => 'Новости', 'slug' => 'news', 'parent_slug' => null],
        ['name' => 'Компания', 'slug' => 'company', 'parent_slug' => 'news'],
        ['name' => 'Продукт', 'slug' => 'product', 'parent_slug' => 'news'],
    ]]);

    $tree = app(AiOperations::class)->suggestCategories(
        new SuggestCategoriesRequestDTO(projectDescription: 'Корпоративный блог'),
    );

    expect($tree->categories)->toHaveCount(1)
        ->and($tree->categories[0]->slug)->toBe('news')
        ->and(array_map(fn ($c) => $c->slug, $tree->categories[0]->children))->toBe(['company', 'product']);
});

test('generate post returns title slug and body', function () {
    fakeAi(['title' => 'Заголовок', 'slug' => 'zagolovok', 'body' => '<p>Тело</p>']);

    $draft = app(AiOperations::class)->generatePost(new GeneratePostRequestDTO(topic: 'тема', locale: 'ru'));

    expect($draft->title)->toBe('Заголовок')
        ->and($draft->slug)->toBe('zagolovok')
        ->and($draft->body)->toBe('<p>Тело</p>');
});

test('missing api key fails before any network call', function () {
    config()->set('cms-ai.api_key', null);

    app(AiOperations::class)->rewrite(new RewriteRequestDTO(text: 'x', instruction: 'y'));
})->throws(AiConfigurationException::class, 'OPENAI_API_KEY');

test('provider failure is wrapped and does not leak the key', function () {
    fakeAi(function (): never {
        throw new RuntimeException('401 Unauthorized');
    });

    try {
        app(AiOperations::class)->rewrite(new RewriteRequestDTO(text: 'x', instruction: 'y'));
        $this->fail('Expected AiRequestException');
    } catch (AiRequestException $exception) {
        expect($exception->getMessage())->not->toContain('test-key');
    }
});

test('malformed response shape is a response error', function () {
    fakeAi(['unexpected' => 'shape']);

    app(AiOperations::class)->rewrite(new RewriteRequestDTO(text: 'x', instruction: 'y'));
})->throws(AiResponseException::class);

test('provider config reaches the sdk as an own instance without touching foreign entries', function () {
    config()->set('cms-ai.base_url', 'https://polza.ai/api/v1');

    app(AiOperations::class); // резолв собирает конфигурацию провайдера

    $instance = 'ai.providers.'.AiProviderConfig::INSTANCE;

    expect(config("{$instance}.driver"))->toBe('openai')
        ->and(config("{$instance}.key"))->toBe('test-key')
        ->and(config("{$instance}.url"))->toBe('https://polza.ai/api/v1')
        // настройки драйвера сохраняются целиком, не только key/url
        ->and(config("{$instance}.store"))->toBe(config('ai.providers.openai.store'))
        // чужая запись провайдера не переписывается (было — мутация в boot())
        ->and(config('ai.providers.openai.key'))->not->toBe('test-key');
});

test('embeddings return one vector per text in the input order', function () {
    Embeddings::fake([[[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]]);

    $result = app(AiOperations::class)->embed(new EmbedRequestDTO(texts: ['раз', 'два', 'три']));

    expect($result->vectors)->toBe([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]);
});

test('embeddings for an empty set never reach the provider', function () {
    Embeddings::fake();

    $result = app(AiOperations::class)->embed(new EmbedRequestDTO(texts: []));

    expect($result->vectors)->toBe([]);
    Embeddings::assertNothingGenerated();
});

test('embedding dimension is known without calling the provider', function () {
    config()->set('cms-ai.embedding_dimension', 768);
    Embeddings::fake();

    expect(app(AiOperations::class)->embeddingDimension())->toBe(768);
    Embeddings::assertNothingGenerated();
});

test('embeddings count mismatch is a response error', function () {
    Embeddings::fake([[[0.1, 0.2]]]);

    app(AiOperations::class)->embed(new EmbedRequestDTO(texts: ['раз', 'два']));
})->throws(AiResponseException::class);

test('run instruct returns the response parsed by the given schema', function () {
    fakeAi(['description' => 'Автомобильный портал', 'categories' => [
        ['name' => 'Седаны', 'slug' => 'sedany'],
    ]]);

    $result = app(AiOperations::class)->runInstruct(new RunInstructRequestDTO(
        rule: 'Опиши проект и собери категории',
        schema: [
            'type' => 'object',
            'properties' => [
                'description' => ['type' => 'string'],
                'categories' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'name' => ['type' => 'string'],
                            'slug' => ['type' => 'string'],
                        ],
                        'required' => ['name', 'slug'],
                    ],
                ],
            ],
            'required' => ['description', 'categories'],
        ],
        input: ['topic' => 'автомобили'],
    ));

    expect($result->output['description'])->toBe('Автомобильный портал')
        ->and($result->output['categories'][0]['slug'])->toBe('sedany');
});

test('run instruct supports a nullable property', function () {
    fakeAi(['title' => 'Тема', 'category' => null]);

    $result = app(AiOperations::class)->runInstruct(new RunInstructRequestDTO(
        rule: 'Собери тему',
        schema: [
            'type' => 'object',
            'properties' => [
                'title' => ['type' => 'string', 'description' => 'Заголовок темы'],
                'category' => ['type' => ['string', 'null']],
            ],
            'required' => ['title', 'category'],
        ],
    ));

    expect($result->output)->toBe(['title' => 'Тема', 'category' => null]);
});

test('run instruct rejects a schema that is not an object at the root', function () {
    Embeddings::fake();

    app(AiOperations::class)->runInstruct(new RunInstructRequestDTO(
        rule: 'x',
        schema: ['type' => 'array', 'items' => ['type' => 'string']],
    ));
})->throws(AiSchemaException::class);

test('run instruct rejects a schema without properties', function () {
    app(AiOperations::class)->runInstruct(new RunInstructRequestDTO(rule: 'x', schema: ['type' => 'object']));
})->throws(AiSchemaException::class);

test('run instruct rejects an unsupported construct before any network call', function () {
    StructuredAgent::fake([fn (): never => throw new RuntimeException('provider must not be called')]);

    app(AiOperations::class)->runInstruct(new RunInstructRequestDTO(
        rule: 'x',
        schema: [
            'type' => 'object',
            'properties' => [
                'value' => ['$ref' => 'https://example.com/schema.json'],
            ],
        ],
    ));
})->throws(AiSchemaException::class);

test('extract topics maps rows to dtos and caps them at the requested count', function () {
    fakeAi(['topics' => [
        ['title' => 'Топ-10 седанов', 'rationale' => 'Есть подборки в источниках', 'category' => 'Седаны'],
        ['title' => 'Электромобили 2026', 'rationale' => 'Обзоры новинок', 'category' => null],
        ['title' => 'Лишняя тема', 'rationale' => 'сверх запроса', 'category' => null],
    ]]);

    $result = app(AiOperations::class)->extractTopics(new ExtractTopicsRequestDTO(
        query: 'Расскажи про топ 10 автомобилей',
        materials: ['обзор седанов', 'обзор электромобилей'],
        maxCount: 2,
        categories: ['Седаны'],
    ));

    expect($result->topics)->toHaveCount(2)
        ->and($result->topics[0]->title)->toBe('Топ-10 седанов')
        ->and($result->topics[0]->category)->toBe('Седаны')
        ->and($result->topics[1]->category)->toBeNull();
});

test('extract topics returns fewer topics when materials do not support more', function () {
    fakeAi(['topics' => [
        ['title' => 'Единственная тема', 'rationale' => 'материала мало', 'category' => null],
    ]]);

    $result = app(AiOperations::class)->extractTopics(new ExtractTopicsRequestDTO(
        query: 'узкий запрос',
        materials: ['короткий материал'],
        maxCount: 10,
    ));

    expect($result->topics)->toHaveCount(1);
});

test('malformed topic row is a response error', function () {
    fakeAi(['topics' => [['title' => 'Без пояснения']]]);

    app(AiOperations::class)->extractTopics(new ExtractTopicsRequestDTO(query: 'q', materials: ['m']));
})->throws(AiResponseException::class);

test('run instruct rejects a response missing a required field', function () {
    fakeAi(['description' => 'Есть', 'categories' => []]);

    app(AiOperations::class)->runInstruct(new RunInstructRequestDTO(
        rule: 'x',
        schema: [
            'type' => 'object',
            'properties' => [
                'description' => ['type' => 'string'],
                'topic' => ['type' => 'string'],
                'categories' => ['type' => 'array', 'items' => ['type' => 'string']],
            ],
            'required' => ['description', 'topic', 'categories'],
        ],
    ));
})->throws(AiResponseException::class);
