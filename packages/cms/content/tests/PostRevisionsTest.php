<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Cms\Content\Domain\Models\Revision;
use Cms\Shared\Tenant\ProjectContext;

/** Пост с тремя сохранениями: заголовок меняется на каждом шаге. */
function postWithThreeRevisions(array $headers): array
{
    $post = test()->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Версия один', 'slug' => 'versions', 'blocks' => [['title' => '', 'markdown' => 'v1']],
    ], $headers)->assertCreated()->json('data');

    foreach (['Версия два', 'Версия три'] as $index => $title) {
        test()->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
            'title' => $title, 'blocks' => [['title' => '', 'markdown' => 'v'.($index + 2)]],
        ], $headers)->assertOk();
    }

    return $post;
}

test('версии пронумерованы от первой, заголовок берётся из снимка', function () {
    $headers = actingAsContentOperator();
    $post = postWithThreeRevisions($headers);

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data');

    expect(array_column($revisions, 'number'))->toBe([3, 2, 1])
        ->and(array_column($revisions, 'title'))->toBe(['Версия три', 'Версия два', 'Версия один']);
});

test('своя версия удаляется, пост и остальные версии не меняются', function () {
    $headers = actingAsContentOperator();
    $post = postWithThreeRevisions($headers);

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data');
    $middle = $revisions[1];

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$middle['id']}", [], $headers)
        ->assertNoContent();

    $left = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data');
    $current = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", $headers)
        ->assertOk()->json('data');

    expect($left)->toHaveCount(2)
        ->and(array_column($left, 'id'))->not->toContain($middle['id'])
        ->and($current['title'])->toBe('Версия три')
        ->and($current['body'])->toBe('v3');
});

test('версия другого поста не удаляется', function () {
    $headers = actingAsContentOperator();
    $post = postWithThreeRevisions($headers);

    $other = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Другой', 'slug' => 'other', 'blocks' => [['title' => '', 'markdown' => 'o1']],
    ], $headers)->assertCreated()->json('data');

    $foreign = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$other['id']}/revisions", $headers)
        ->assertOk()->json('data')[0];

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$foreign['id']}", [], $headers)
        ->assertStatus(422);

    expect(Revision::query()->whereKey($foreign['id'])->exists())->toBeTrue();
});

test('версия другого проекта не удаляется', function () {
    $headers = actingAsContentOperator();
    $post = postWithThreeRevisions($headers);

    app(ProjectContext::class)->set('proj-2');
    $stranger = Post::factory()->create(['project_id' => 'proj-2', 'title' => 'Чужой', 'slug' => 'stranger']);
    $strangerRevision = $stranger->revisions()->create([
        'project_id' => 'proj-2', 'snapshot' => ['title' => 'Чужой'], 'author_id' => null, 'created_at' => now(),
    ]);
    app(ProjectContext::class)->set('proj-1');

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$strangerRevision->id}", [], $headers)
        ->assertStatus(422);

    expect(Revision::acrossProjects()->whereKey($strangerRevision->id)->exists())->toBeTrue();
});

test('удаление версии без права управления постами отклоняется', function () {
    $headers = actingAsContentOperator();
    $post = postWithThreeRevisions($headers);
    $revision = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data')[0];

    $readOnly = actingAsContentOperator(permissions: ['content.posts.view']);

    $this->deleteJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$revision['id']}", [], $readOnly)
        ->assertStatus(403);

    expect(Revision::query()->whereKey($revision['id'])->exists())->toBeTrue();
});
