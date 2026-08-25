<?php

declare(strict_types=1);

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Translate\TranslateResultDTO;
use Cms\Content\Domain\Models\Category;
use Cms\Localization\Infrastructure\Jobs\TranslateMissingJob;
use Cms\Shared\Tenant\ProjectContext;

/**
 * Переводимые имена категорий: форма записи, откат на локаль по умолчанию и
 * автоперевод через порт TranslatableSubjectRepository.
 *
 * Тесты живут в пакете-владельце таблицы `categories`: словарь переводов о
 * категориях знает только через порт (Decision 10, задача 3.7).
 */
function categoryTranslationHeaders(array $permissions): array
{
    return actingAsContentOperator('proj-1', array_merge($permissions, ['content.posts.view']));
}

test('category name accepts both string and per-locale forms', function () {
    $headers = categoryTranslationHeaders(['content.categories.view', 'content.categories.manage']);

    // строковая форма — как раньше
    $plain = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Guides',
    ], $headers)->assertCreated()->json('data');
    expect($plain['name'])->toBe('Guides')
        ->and($plain['name_translations'])->toBe(['en' => 'Guides'])
        ->and($plain['slug'])->toBe('guides');

    // переводимая форма — как в постановке: title = [en, ru], slug един
    $translated = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => ['en' => 'Categories', 'ru' => 'Категории'],
    ], $headers)->assertCreated()->json('data');
    expect($translated['name'])->toBe('Categories')
        ->and($translated['name_translations'])->toBe(['en' => 'Categories', 'ru' => 'Категории'])
        ->and($translated['slug'])->toBe('categories');
});

test('missing locale falls back to the default locale name', function () {
    $headers = categoryTranslationHeaders(['content.categories.view', 'content.categories.manage']);
    app(ProjectContext::class)->set('proj-1');

    $id = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => ['en' => 'News'],
    ], $headers)->assertCreated()->json('data.id');

    $category = Category::query()->findOrFail($id);
    expect($category->getTranslation('name', 'ru', true))->toBe('News');
});

test('translate-missing fills category names and marks them machine', function () {
    app(ProjectContext::class)->set('proj-1');
    $category = Category::create(['name' => ['en' => 'News'], 'slug' => 'tm-news']);

    app()->instance(AiOperations::class, new class implements AiOperations
    {
        public function translate($request): TranslateResultDTO
        {
            return new TranslateResultDTO(translations: ['name' => ['ru' => 'Новости']]);
        }

        public function rewrite($r): never
        {
            throw new RuntimeException('unused');
        }

        public function normalize($r): never
        {
            throw new RuntimeException('unused');
        }

        public function suggestCategories($r): never
        {
            throw new RuntimeException('unused');
        }

        public function generatePost($r): never
        {
            throw new RuntimeException('unused');
        }
    });

    app()->call([new TranslateMissingJob('proj-1', ['en', 'ru'], 'en', subject: 'categories'), 'handle']);

    $category->refresh();
    expect($category->getTranslations('name'))->toBe(['en' => 'News', 'ru' => 'Новости'])
        ->and($category->name_machine)->toBe(['ru' => true]);

    // ручная правка ru снимает пометку
    $headers = categoryTranslationHeaders(['content.categories.view', 'content.categories.manage']);
    $this->putJson("/api/admin/v1/projects/proj-1/content/categories/{$category->id}", [
        'name' => ['ru' => 'Новости проекта'],
    ], $headers)->assertOk();
    expect($category->refresh()->name_machine)->toBe([]);
});
