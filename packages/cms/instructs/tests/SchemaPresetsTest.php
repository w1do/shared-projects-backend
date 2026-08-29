<?php

declare(strict_types=1);

use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Infrastructure\Persistence\SchemaPresetCatalog;
use Cms\Research\Application\Actions\CreateCategoryTreeAction;

/** @return list<string> имена полей пресета по его ключу */
function presetFieldNames(string $key): array
{
    foreach (SchemaPresetCatalog::all() as $preset) {
        if ($preset['key'] === $key) {
            return array_map(static fn (array $field): string => $field['name'], $preset['fields']);
        }
    }

    return [];
}

/** @return list<string> имена полей элемента массива объектов */
function presetItemFieldNames(string $key, string $field): array
{
    foreach (SchemaPresetCatalog::all() as $preset) {
        foreach ($preset['fields'] as $candidate) {
            if ($preset['key'] === $key && $candidate['name'] === $field) {
                return array_map(
                    static fn (array $item): string => $item['name'],
                    $candidate['item']['fields'] ?? [],
                );
            }
        }
    }

    return [];
}

/** @return list<string> ключи формы `array{...}` из phpdoc параметра метода */
function docBlockShapeKeys(string $class, string $method): array
{
    $doc = (string) (new ReflectionMethod($class, $method))->getDocComment();

    if (preg_match('/array\{([^}]*)\}/', $doc, $matches) !== 1) {
        return [];
    }

    $keys = [];

    foreach (explode(',', $matches[1]) as $part) {
        $name = trim(explode(':', $part)[0]);

        if ($name !== '') {
            $keys[] = $name;
        }
    }

    return $keys;
}

test('catalog carries a preset per platform entity', function () {
    $presets = SchemaPresetCatalog::all();

    expect(array_map(static fn (array $preset): string => $preset['key'], $presets))
        ->toBe(['categories', 'post', 'seo']);

    foreach ($presets as $preset) {
        expect($preset['title'])->not->toBe('')
            ->and($preset['entity'])->not->toBe('')
            ->and($preset['categories'])->not->toBe([])
            ->and($preset['fields'])->not->toBe([]);

        foreach ($preset['categories'] as $category) {
            expect($category)->toBeInstanceOf(InstructCategory::class);
        }

        foreach ($preset['fields'] as $field) {
            expect($field)->toHaveKeys(['name', 'type', 'required', 'description'])
                ->and($field['name'])->not->toBe('')
                ->and($field['description'])->not->toBe('')
                ->and($field['required'])->toBeBool();
        }
    }
});

test('presets name the instruct categories they apply to', function () {
    $byKey = [];

    foreach (SchemaPresetCatalog::all() as $preset) {
        $byKey[$preset['key']] = array_map(
            static fn (InstructCategory $category): string => $category->value,
            $preset['categories'],
        );
    }

    expect($byKey['seo'])->toBe([InstructCategory::PostSeo->value])
        ->and($byKey['post'])->toBe([InstructCategory::PostBody->value])
        ->and($byKey['categories'])->toBe([
            InstructCategory::CategoryTree->value,
            InstructCategory::ProjectDescription->value,
        ]);
});

test('seo preset matches the fields the platform stores', function () {
    $dtoFields = array_map(
        static fn (ReflectionParameter $parameter): string => $parameter->getName(),
        (new ReflectionClass(UpsertSeoDTO::class))->getConstructor()?->getParameters() ?? [],
    );

    sort($dtoFields);
    $presetFields = presetFieldNames('seo');
    sort($presetFields);

    // Равенство в обе стороны: поле, добавленное только с одной стороны, красит тест
    expect($presetFields)->toBe($dtoFields);
});

test('categories preset matches the shape the platform parses', function () {
    $parsed = docBlockShapeKeys(CreateCategoryTreeAction::class, 'handle');
    sort($parsed);

    $presetFields = presetItemFieldNames('categories', 'categories');
    sort($presetFields);

    expect($parsed)->not->toBe([])
        ->and($presetFields)->toBe($parsed);
});

test('post preset matches the keys the post generation reads', function () {
    $presetFields = presetFieldNames('post');
    sort($presetFields);

    expect($presetFields)->toBe(['blocks', 'slug', 'tags', 'title']);

    // Состав блока совпадает с тем, что разбирает генерация поста
    expect(presetItemFieldNames('post', 'blocks'))->toBe(['title', 'markdown']);
});

test('schema presets endpoint returns the catalog', function () {
    $headers = actingAsContentOperator('proj-1', ['content.instructs.view']);

    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/instructs/schema-presets', $headers)
        ->assertOk();

    expect(array_column($response->json('data'), 'key'))->toBe(['categories', 'post', 'seo']);

    $response->assertJsonPath('data.2.categories', [InstructCategory::PostSeo->value]);
});

test('schema presets are the same for every project', function () {
    $first = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/instructs/schema-presets',
        actingAsContentOperator('proj-1', ['content.instructs.view']),
    )->assertOk()->json('data');

    app()->forgetScopedInstances();

    $second = $this->getJson(
        '/api/admin/v1/projects/proj-2/content/instructs/schema-presets',
        actingAsContentOperator('proj-2', ['content.instructs.view']),
    )->assertOk()->json('data');

    expect($second)->toBe($first);
});

test('schema presets endpoint is closed by the instructs view permission', function () {
    $headers = actingAsContentOperator('proj-1', ['content.posts.view']);

    $this->getJson('/api/admin/v1/projects/proj-1/content/instructs/schema-presets', $headers)
        ->assertStatus(403);
});
