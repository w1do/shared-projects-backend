<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Характеризационные тесты частичного обновления (задача 0.4 плана
 * refactor-ddd-cqrs-packages, инвариант И1: «ключ отсутствует» ≠ «ключ = null»).
 *
 * Проверяют СОСТОЯНИЕ БД, а не тело ответа: снимок ответа этот класс поломок
 * не ловит — обнулённый parent_id, перегенерированный slug, отвязанные
 * категории и затёртый body в ответе выглядят как валидные значения.
 *
 * Все фикстуры заданы явными литералами: faker-значений в ассертах нет.
 * Чтение состояния идёт через DB::table — минуя глобальный scope проекта
 * и nested-set-кэш модели, чтобы читать ровно то, что лежит в таблице.
 */
beforeEach(function () {
    // sitemap регенерируется синхронной джобой и пишет артефакт на диск local
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

/** @return array<string, mixed> */
function guard04CategoryRow(int $id): array
{
    return (array) DB::table('categories')->where('id', $id)->first();
}

test('guard: 0.4 category partial update keeps parent', function () {
    $headers = actingAsContentOperator();

    $parent = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Parent A', 'slug' => 'parent-a',
    ], $headers)->assertCreated()->json('data');

    $child = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Child B', 'slug' => 'child-b', 'parent_id' => $parent['id'],
    ], $headers)->assertCreated()->json('data');

    $parentBefore = guard04CategoryRow($parent['id']);
    $childBefore = guard04CategoryRow($child['id']);

    // предусловие фикстуры: B действительно вложен в A
    expect($childBefore['parent_id'])->toEqual($parent['id'])
        ->and((int) $childBefore['_lft'])->toBeGreaterThan((int) $parentBefore['_lft'])
        ->and((int) $childBefore['_rgt'])->toBeLessThan((int) $parentBefore['_rgt']);

    // тело без parent_id: ключ отсутствует, а не равен null
    $this->putJson("/api/admin/v1/projects/proj-1/content/categories/{$child['id']}", [
        'name' => 'Renamed B', 'slug' => 'renamed-b',
    ], $headers)->assertOk();

    $parentAfter = guard04CategoryRow($parent['id']);
    $childAfter = guard04CategoryRow($child['id']);

    // родитель прежний, узел не уехал в корень вместе с поддеревом
    expect($childAfter['parent_id'])->toEqual($parent['id'])
        ->and((int) $childAfter['_lft'])->toBe((int) $childBefore['_lft'])
        ->and((int) $childAfter['_rgt'])->toBe((int) $childBefore['_rgt'])
        ->and((int) $parentAfter['_lft'])->toBe((int) $parentBefore['_lft'])
        ->and((int) $parentAfter['_rgt'])->toBe((int) $parentBefore['_rgt']);

    // переданные поля при этом применились
    expect($childAfter['slug'])->toBe('renamed-b');
});

test('guard: 0.4 post partial update keeps slug categories and body', function () {
    $headers = actingAsContentOperator();

    $first = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'News', 'slug' => 'news',
    ], $headers)->assertCreated()->json('data');
    $second = $this->postJson('/api/admin/v1/projects/proj-1/content/categories', [
        'name' => 'Sport', 'slug' => 'sport',
    ], $headers)->assertCreated()->json('data');

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Old Title',
        'slug' => 'old-slug',
        'body' => 'Original body',
        'locale' => 'ru',
        'translation_group' => 'group-a',
        'categories' => [$first['id'], $second['id']],
        'is_index' => false,
    ], $headers)->assertCreated()->json('data');

    expect(DB::table('category_post')->where('post_id', $post['id'])->count())->toBe(2);

    // тело только с title: slug, body, locale, translation_group, categories не переданы
    $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'New Title',
    ], $headers)->assertOk();

    $row = (array) DB::table('posts')->where('id', $post['id'])->first();

    expect($row['title'])->toBe('New Title')
        ->and($row['slug'])->toBe('old-slug')          // слаг не перегенерирован из нового title
        ->and($row['body'])->toBe('Original body')     // body не затёрт в null
        ->and($row['locale'])->toBe('ru')
        ->and($row['translation_group'])->toBe('group-a')
        ->and((int) $row['is_index'])->toBe(0)
        ->and(DB::table('category_post')->where('post_id', $post['id'])->count())->toBe(2);
});

test('guard: 0.4 page partial update keeps body', function () {
    $headers = actingAsContentOperator();

    $page = $this->postJson('/api/admin/v1/projects/proj-1/content/pages', [
        'title' => 'Old Title',
        'slug' => 'old-page-slug',
        'body' => 'Original page body',
        'locale' => 'ru',
        'is_index' => false,
    ], $headers)->assertCreated()->json('data');

    // Находка задачи 0.4: у таблицы pages НЕТ колонки translation_group
    // (0002_01_01_000000_create_content_tables.php: она есть только у posts),
    // и UpsertPageDTO её не объявляет. Фиксируем факт: если колонка появится,
    // этот guard обязан быть дополнен проверкой её сохранности.
    expect(Schema::hasColumn('pages', 'translation_group'))->toBeFalse();

    // тело только с title
    $this->putJson("/api/admin/v1/projects/proj-1/content/pages/{$page['id']}", [
        'title' => 'New Title',
    ], $headers)->assertOk();

    $row = (array) DB::table('pages')->where('id', $page['id'])->first();

    expect($row['title'])->toBe('New Title')
        ->and($row['body'])->toBe('Original page body') // body не затёрт в null
        ->and($row['slug'])->toBe('old-page-slug')      // слаг не перегенерирован из нового title
        ->and($row['locale'])->toBe('ru')
        ->and((int) $row['is_index'])->toBe(0)
        ->and($row['status'])->toBe('draft');
});
