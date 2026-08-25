<?php

declare(strict_types=1);

use Cms\Content\Domain\Models\Post;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Cache;

/**
 * Задача 0.13, инвариант И12: форма закэшированного значения меняется только
 * вместе с ключом.
 *
 * Ключ `content:{project}:v{version}:{key}` (ContentCache:19) переживает деплой:
 * после выката в Redis лежат значения, записанные ПРЕДЫДУЩЕЙ версией кода.
 * Тест кладёт под текущий ключ значение в текущем формате
 * (`ApiResponse::cursorPage(...)->getData(true)` — массив `{data, meta}` из
 * PublicContentController:33-45) и требует, чтобы эндпоинт отдал именно его.
 *
 * Подложенное значение — маркерное и заведомо расходится с содержимым БД,
 * поэтому совпадение доказывает чтение кэша, а не выборку из базы.
 */
test('guard: 0.13 public posts serve warm cache value in current format', function () {
    app(ProjectContext::class)->set('proj-1');

    // В БД лежит другой пост: если ответ соберётся из базы, маркер не совпадёт.
    Post::factory()->create([
        'title' => 'Database post',
        'slug' => 'database-post',
        'body' => 'Database body',
        'locale' => 'ru',
        'status' => 'published',
        'published_at' => '2024-01-01 00:00:00',
        'is_index' => true,
    ]);

    // Версия кэша проекта не инкрементировалась — ContentCache::remember() берёт дефолт 1.
    expect(Cache::get('content:ver:proj-1'))->toBeNull();

    // Ключ ровно как его строит контроллер:
    // 'posts:'.md5(json_encode($request->only(['locale','category','cursor'])))
    // для GET /api/v1/content/posts без параметров only() отдаёт [], json_encode([]) === '[]'.
    expect(md5('[]'))->toBe('d751713988987e9331980363e24189ce');

    $key = 'content:proj-1:v1:posts:d751713988987e9331980363e24189ce';

    // Значение в текущем формате: конверт cursorPage — data (список PostDTO) + meta.
    $warm = [
        'data' => [
            [
                'id' => 4242,
                'title' => 'Warm cache marker post',
                'slug' => 'warm-cache-marker-post',
                'body' => 'Warm cache marker body',
                'locale' => 'ru',
                'translation_group' => null,
                'status' => 'published',
                'scheduled_at' => null,
                'published_at' => '2024-01-01T00:00:00+00:00',
                'is_index' => true,
                'categories' => [],
                'seo' => null,
            ],
        ],
        'meta' => [
            'per_page' => 25,
            'next_cursor' => null,
            'prev_cursor' => null,
        ],
    ];

    Cache::put($key, $warm, 300);

    $site = actingAsProjectSite();

    $response = $this->getJson('/api/v1/content/posts', $site);

    $response->assertOk();

    expect($response->json('data'))->toHaveCount(1)
        // Маркер: из БД пришёл бы 'Database post'
        ->and($response->json('data.0.title'))->toBe('Warm cache marker post')
        ->and($response->json('data.0.id'))->toBe(4242)
        ->and($response->json('meta.per_page'))->toBe(25)
        ->and($response->json('meta.next_cursor'))->toBeNull();

    $response->assertExactJson($warm);
});
