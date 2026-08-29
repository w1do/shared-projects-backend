<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Cms\Content\Domain\Models\Tag;
use Cms\Shared\Tenant\ProjectContext;

function tagHeaders(string $projectId = 'proj-1'): array
{
    return actingAsContentOperator($projectId);
}

test('the platform tag model replaces the package one', function () {
    expect(config('tags.tag_model'))->toBe(Tag::class);
});

test('a new tag is created and an existing one is reused without duplicates', function () {
    $headers = tagHeaders();

    $first = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Седаны 2026',
        'tags' => ['седаны', 'обзор'],
    ], $headers)->assertCreated()->json('data');

    expect($first['tags'])->toEqualCanonicalizing(['седаны', 'обзор'])
        ->and(Tag::query()->count())->toBe(2);

    $second = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Кроссоверы 2026',
        'tags' => ['седаны', 'седаны', 'кроссоверы'],
    ], $headers)->assertCreated()->json('data');

    expect($second['tags'])->toEqualCanonicalizing(['седаны', 'кроссоверы'])
        ->and(Tag::query()->count())->toBe(3);
});

test('removing a tag from a post keeps the tag in the project', function () {
    $headers = tagHeaders();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Седаны 2026',
        'tags' => ['седаны', 'обзор'],
    ], $headers)->assertCreated()->json('data');

    $updated = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Седаны 2026',
        'tags' => ['седаны'],
    ], $headers)->assertOk()->json('data');

    expect($updated['tags'])->toBe(['седаны'])
        ->and(Tag::query()->count())->toBe(2);
});

test('tags are isolated between projects', function () {
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Седаны 2026',
        'tags' => ['седаны'],
    ], tagHeaders())->assertCreated();

    $this->postJson('/api/admin/v1/projects/proj-2/content/posts', [
        'title' => 'Седаны второго проекта',
        'tags' => ['седаны'],
    ], tagHeaders('proj-2'))->assertCreated();

    app(ProjectContext::class)->set('proj-1');
    expect(Tag::query()->count())->toBe(1);

    app(ProjectContext::class)->set('proj-2');
    expect(Tag::query()->count())->toBe(1);

    // Одноимённые теги разных проектов — разные записи
    expect(Tag::acrossProjects()->count())->toBe(2);
});

test('tags left out of the payload are not dropped', function () {
    $headers = tagHeaders();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Седаны 2026',
        'tags' => ['седаны'],
    ], $headers)->assertCreated()->json('data');

    $updated = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Седаны 2026 — обновлено',
    ], $headers)->assertOk()->json('data');

    expect($updated['tags'])->toBe(['седаны']);
});

test('public api filters published posts by tag', function () {
    $headers = tagHeaders();

    $tagged = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Седаны 2026',
        'tags' => ['седаны'],
    ], $headers)->assertCreated()->json('data');

    $other = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Кроссоверы 2026',
        'tags' => ['кроссоверы'],
    ], $headers)->assertCreated()->json('data');

    foreach ([$tagged['id'], $other['id']] as $id) {
        $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$id}/status", ['status' => 'published'], $headers)
            ->assertOk();
    }

    // Черновик с тем же тегом в публичную выдачу не попадает
    $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Черновик про седаны',
        'tags' => ['седаны'],
    ], $headers)->assertCreated();

    $response = $this->getJson('/api/v1/content/posts?tag=седаны', actingAsProjectSite())->assertOk()->json('data');

    expect($response)->toHaveCount(1)
        ->and($response[0]['title'])->toBe('Седаны 2026')
        ->and($response[0]['tags'])->toBe(['седаны']);
});

test('post tags survive a reload', function () {
    $headers = tagHeaders();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Седаны 2026',
        'tags' => ['седаны', 'обзор'],
    ], $headers)->assertCreated()->json('data');

    $shown = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers)
        ->assertOk()->json('data');

    expect($shown['tags'])->toEqualCanonicalizing(['седаны', 'обзор']);
});

test('a post keeps working without tags', function () {
    $post = Post::create(['project_id' => 'proj-1', 'title' => 'Без тегов', 'slug' => 'bez-tegov']);

    expect($post->tags()->count())->toBe(0);
});
