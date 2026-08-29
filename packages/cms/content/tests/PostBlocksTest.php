<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    config(['cms-content.site_url' => 'https://site.test']);
});

/** @return array<int, array<string, string>> */
function blocksPayload(int $count = 2): array
{
    return array_map(
        static fn (int $index): array => [
            'title' => "Заголовок {$index}",
            'markdown' => "Текст блока {$index} с **разметкой**.",
        ],
        range(1, $count),
    );
}

test('post keeps block order and identifiers on read', function () {
    $headers = actingAsContentOperator();

    $created = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Blocks post', 'blocks' => blocksPayload(3),
    ], $headers)->assertCreated()->json('data');

    expect(array_column($created['blocks'], 'title'))
        ->toBe(['Заголовок 1', 'Заголовок 2', 'Заголовок 3']);

    $read = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$created['id']}", $headers)
        ->assertOk()->json('data');

    expect($read['blocks'])->toBe($created['blocks']);
});

test('platform assigns an identifier to a block without one', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Ids', 'blocks' => blocksPayload(2),
    ], $headers)->assertCreated()->json('data');

    foreach ($post['blocks'] as $block) {
        expect($block['id'])->toMatch('/^[0-9A-HJKMNP-TV-Z]{26}$/');
    }

    expect($post['blocks'][0]['id'])->not->toBe($post['blocks'][1]['id']);
});

test('block identifiers survive edits and reordering', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Stable', 'blocks' => blocksPayload(2),
    ], $headers)->assertCreated()->json('data');

    [$first, $second] = $post['blocks'];

    $updated = $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Stable',
        // Порядок переставлен, название и текст первого блока изменены
        'blocks' => [
            ['id' => $second['id'], 'title' => $second['title'], 'markdown' => $second['markdown']],
            ['id' => $first['id'], 'title' => 'Другое название', 'markdown' => 'Другой текст'],
        ],
    ], $headers)->assertOk()->json('data');

    expect(array_column($updated['blocks'], 'id'))->toBe([$second['id'], $first['id']])
        ->and($updated['blocks'][1]['title'])->toBe('Другое название');
});

test('body is composed from blocks and the sent body is ignored', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Composed',
        'body' => 'Тело, присланное клиентом',
        'blocks' => [
            ['title' => 'Какие бывают авто', 'markdown' => 'Первый абзац.'],
            ['title' => '', 'markdown' => 'Блок без названия.'],
        ],
    ], $headers)->assertCreated()->json('data');

    expect($post['body'])->toBe("## Какие бывают авто\n\nПервый абзац.\n\nБлок без названия.")
        ->and($post['body'])->not->toContain('присланное клиентом');
});

test('post without blocks keeps an empty body', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Empty', 'blocks' => [],
    ], $headers)->assertCreated()->json('data');

    expect($post['blocks'])->toBe([])
        ->and($post['body'])->toBeNull();
});

test('blocks are rejected when a block has no text or a duplicate id', function () {
    $headers = actingAsContentOperator();

    // Ключ ошибки содержит точки — читаем детали как массив, а не путём data_get
    $noText = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Broken', 'blocks' => [['title' => 'Без текста']],
    ], $headers)->assertStatus(422)->json('error.details');

    expect($noText['blocks.0.markdown'][0])->toBe('The blocks.0.markdown field is required.');

    $duplicate = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Duplicate',
        'blocks' => [
            ['id' => 'same-id', 'title' => 'A', 'markdown' => 'a'],
            ['id' => 'same-id', 'title' => 'B', 'markdown' => 'b'],
        ],
    ], $headers)->assertStatus(422)->json('error.details');

    expect($duplicate['blocks.1.id'][0])->toBe('Block id must be unique within the post.');

    expect(Post::acrossProjects()->count())->toBe(0);
});

test('restoring a revision brings back blocks with their order and identifiers', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Revised', 'blocks' => blocksPayload(2),
    ], $headers)->assertCreated()->json('data');

    $original = $post['blocks'];

    $this->putJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}", [
        'title' => 'Revised', 'blocks' => [['title' => 'Один', 'markdown' => 'Только один блок']],
    ], $headers)->assertOk();

    $revisions = $this->getJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions", $headers)
        ->assertOk()->json('data');

    // Первая ревизия — снимок исходного состояния с двумя блоками
    $restored = $this->postJson(
        "/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/revisions/{$revisions[count($revisions) - 1]['id']}/restore",
        [],
        $headers,
    )->assertOk()->json('data');

    expect($restored['blocks'])->toBe($original);
});

test('public api returns post blocks', function () {
    $headers = actingAsContentOperator();

    $post = $this->postJson('/api/admin/v1/projects/proj-1/content/posts', [
        'title' => 'Public blocks', 'slug' => 'public-blocks', 'blocks' => blocksPayload(2),
    ], $headers)->assertCreated()->json('data');

    $this->postJson("/api/admin/v1/projects/proj-1/content/posts/{$post['id']}/status", [
        'status' => 'published',
    ], $headers)->assertOk();

    $this->getJson('/api/v1/content/posts/public-blocks', actingAsProjectSite())
        ->assertOk()
        ->assertJsonPath('data.blocks', $post['blocks'])
        ->assertJsonPath('data.body', $post['body']);
});

test('a post migrated from a plain body keeps it as a single block', function () {
    app(ProjectContext::class)->set('proj-1');

    // Так выглядит запись после миграции: прежнее тело перенесено одним блоком
    $post = Post::factory()->create([
        'title' => 'Legacy', 'slug' => 'legacy', 'body' => '<p>Старое тело</p>',
        'blocks' => [['id' => '01LEGACYBLOCKIDENTIFIER01', 'title' => '', 'markdown' => '<p>Старое тело</p>']],
    ]);

    $read = $this->getJson(
        "/api/admin/v1/projects/proj-1/content/posts/{$post->id}",
        actingAsContentOperator(),
    )->assertOk()->json('data');

    expect($read['blocks'])->toHaveCount(1)
        ->and($read['blocks'][0]['markdown'])->toBe('<p>Старое тело</p>')
        ->and($read['body'])->toBe('<p>Старое тело</p>');
});
