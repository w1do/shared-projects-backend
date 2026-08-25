<?php

declare(strict_types=1);

use Cms\Ai\Application\DTOs\GeneratePost\GeneratePostRequestDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeRequestDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteRequestDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\SuggestCategoriesRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Ai\Domain\Contracts\AiOperations;
use Cms\Ai\Domain\Exceptions\AiConfigurationException;
use Cms\Ai\Domain\Exceptions\AiRequestException;
use Cms\Ai\Domain\Exceptions\AiResponseException;
use Cms\Ai\Infrastructure\Agents\StructuredAgent;

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
