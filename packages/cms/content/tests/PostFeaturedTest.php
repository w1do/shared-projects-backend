<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

test('признак закрепления возвращается в ответе и переживает повторное чтение', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Закреплённый', 'slug' => 'pinned', 'is_featured' => true,
        'blocks' => [['title' => '', 'markdown' => 'текст']],
    ], $headers)->assertCreated()->json('data');

    $read = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers)
        ->assertOk()->json('data');

    expect($post['is_featured'])->toBeTrue()->and($read['is_featured'])->toBeTrue();
});

test('закрепление второго поста снимает признак с прежнего', function () {
    $headers = actingAsContentOperator();

    $first = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Первый', 'slug' => 'first', 'is_featured' => true,
        'blocks' => [['title' => '', 'markdown' => 'раз']],
    ], $headers)->assertCreated()->json('data');

    $second = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Второй', 'slug' => 'second', 'is_featured' => true,
        'blocks' => [['title' => '', 'markdown' => 'два']],
    ], $headers)->assertCreated()->json('data');

    $featured = Post::query()->where('is_featured', true)->pluck('id')->all();

    expect($featured)->toBe([$second['id']])
        ->and(Post::query()->findOrFail($first['id'])->is_featured)->toBeFalse();
});

test('снятие признака возвращает пост в общий список', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Закреплённый', 'slug' => 'pinned', 'is_featured' => true,
        'blocks' => [['title' => '', 'markdown' => 'текст']],
    ], $headers)->assertCreated()->json('data');

    $updated = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Закреплённый', 'is_featured' => false,
    ], $headers)->assertOk()->json('data');

    expect($updated['is_featured'])->toBeFalse()
        ->and(Post::query()->where('is_featured', true)->count())->toBe(0);
});

test('база не даёт двух закреплённых постов в проекте', function () {
    $headers = actingAsContentOperator();

    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Первый', 'slug' => 'first', 'is_featured' => true,
        'blocks' => [['title' => '', 'markdown' => 'раз']],
    ], $headers)->assertCreated();

    $second = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Второй', 'slug' => 'second',
        'blocks' => [['title' => '', 'markdown' => 'два']],
    ], $headers)->assertCreated()->json('data');

    expect(fn () => DB::table('posts')->where('id', $second['id'])->update(['is_featured' => true]))
        ->toThrow(QueryException::class);
});
