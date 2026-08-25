<?php

declare(strict_types=1);

use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\Resources\ApiCursorCollection;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;
use Illuminate\Pagination\Cursor;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Route;

/**
 * Гейт задачи 1.1: ответ через базовый Resource байт-в-байт равен ответу
 * через ApiResponse — на одиночном объекте, 201 и курсорной странице.
 */
final class ParityItemResource extends ApiResource
{
    public function toArray(Request $request): array
    {
        /** @var array{id: int, name: string, tags: array<string>, extra: object} $item */
        $item = $this->resource;

        return [
            'id' => $item['id'],
            'name' => $item['name'],
            'tags' => $item['tags'],
            'extra' => $item['extra'],
        ];
    }
}

function parityItem(int $id = 1): array
{
    return ['id' => $id, 'name' => "Item {$id}", 'tags' => ['a', 'b'], 'extra' => (object) []];
}

function parityPaginator(int $perPage = 2, bool $hasMore = true): CursorPaginator
{
    $items = [parityItem(1), parityItem(2)];

    return new CursorPaginator(
        $items,
        $perPage,
        $hasMore ? new Cursor(['id' => 0]) : null,
        ['path' => 'http://localhost/api/parity', 'parameters' => ['id']],
    );
}

test('single item via ApiResource is byte-identical to ApiResponse::data', function () {
    Route::get('/parity/manual', fn () => ApiResponse::data(parityItem()));
    Route::get('/parity/resource', fn () => new ParityItemResource(parityItem()));

    $manual = $this->getJson('/parity/manual');
    $resource = $this->getJson('/parity/resource');

    expect($resource->getStatusCode())->toBe($manual->getStatusCode())
        ->and($resource->getContent())->toBe($manual->getContent());
});

test('created item via ApiResource is byte-identical to ApiResponse::created', function () {
    Route::post('/parity/manual-created', fn () => ApiResponse::created(parityItem()));
    Route::post(
        '/parity/resource-created',
        fn (Request $request) => (new ParityItemResource(parityItem()))->toCreatedResponse($request),
    );

    $manual = $this->postJson('/parity/manual-created');
    $resource = $this->postJson('/parity/resource-created');

    expect($resource->getStatusCode())->toBe(201)
        ->and($resource->getStatusCode())->toBe($manual->getStatusCode())
        ->and($resource->getContent())->toBe($manual->getContent());
});

test('cursor page via ApiCursorCollection is byte-identical to ApiResponse::cursorPage', function () {
    Route::get('/parity/manual-page', fn () => ApiResponse::cursorPage(parityPaginator()));
    Route::get('/parity/resource-page', fn () => ApiCursorCollection::make(parityPaginator()));

    $manual = $this->getJson('/parity/manual-page');
    $resource = $this->getJson('/parity/resource-page');

    expect($resource->getStatusCode())->toBe($manual->getStatusCode())
        ->and($resource->getContent())->toBe($manual->getContent());
});

test('cursor page without next page keeps null cursors byte-identical', function () {
    Route::get('/parity/manual-last', fn () => ApiResponse::cursorPage(parityPaginator(2, false)));
    Route::get('/parity/resource-last', fn () => ApiCursorCollection::make(parityPaginator(2, false)));

    $manual = $this->getJson('/parity/manual-last');
    $resource = $this->getJson('/parity/resource-last');

    expect($resource->getContent())->toBe($manual->getContent());
});

test('cursor page with mapping matches ApiResponse::cursorPage with map callback', function () {
    $map = fn (array $item) => ['id' => $item['id'], 'name' => $item['name']];

    Route::get('/parity/manual-mapped', fn () => ApiResponse::cursorPage(parityPaginator(), $map));
    Route::get('/parity/resource-mapped', function () use ($map) {
        return new class(parityPaginator(), $map) extends ApiCursorCollection
        {
            public function __construct($resource, private $mapper)
            {
                parent::__construct($resource);
            }

            public function toArray(Request $request): array
            {
                return $this->collection->map(fn ($item) => ($this->mapper)($item->resource))->all();
            }
        };
    });

    $manual = $this->getJson('/parity/manual-mapped');
    $resource = $this->getJson('/parity/resource-mapped');

    expect($resource->getContent())->toBe($manual->getContent());
});
