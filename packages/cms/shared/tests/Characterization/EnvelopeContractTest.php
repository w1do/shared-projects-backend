<?php

declare(strict_types=1);

use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Http\Request;
use Illuminate\Pagination\Cursor;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Route;

/**
 * Характеризационные снимки конвертов платформы: Cms\Shared\Http\ApiResponse
 * и Cms\Shared\Http\ErrorEnvelope, снятые через реальный HTTP-слой.
 *
 * Это тот формат, который рефакторинг на JsonResource обязан воспроизвести
 * байт-в-байт: ключи (data / meta / error.code / error.message / error.details /
 * error.trace_id), их порядок, статусы, различие {} и [], null-курсоры.
 *
 * Маршруты объявляются прямо в тестах (продакшн-роуты не трогаем) и проходят
 * через полный kernel: глобальный AssignTraceId и обработчик исключений
 * из bootstrap/app.php. База данных не нужна.
 */

/** Фиксированный набор элементов страницы — никакого faker, снимок детерминирован. */
function contractPageItems(int $count): array
{
    $titles = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

    return array_map(
        static fn (int $index): array => ['id' => $index + 1, 'title' => $titles[$index]],
        range(0, $count - 1),
    );
}

test('contract: shared envelope data', function () {
    Route::get('/api/__contract/data', fn () => ApiResponse::data([
        'key' => 'site-a',
        'name' => 'Site A',
        'enabled' => true,
        'weight' => 0,
        'tags' => [],
        'settings' => (object) [],
        'nested' => ['locale' => 'ru', 'currency' => 'RUB'],
        'missing' => null,
    ]));

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/data'), 'envelope-data');
});

test('contract: shared envelope data with custom status', function () {
    Route::get('/api/__contract/data-207', fn () => ApiResponse::data(['state' => 'partial'], 207));

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/data-207'), 'envelope-data-custom-status');
});

test('contract: shared envelope data with a list payload', function () {
    Route::get('/api/__contract/data-list', fn () => ApiResponse::data(contractPageItems(2)));

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/data-list'), 'envelope-data-list');
});

test('contract: shared envelope created', function () {
    Route::post('/api/__contract/created', fn () => ApiResponse::created([
        'id' => 42,
        'key' => 'site-b',
        'name' => 'Site B',
    ]));

    ResponseSnapshot::assertMatches($this->postJson('/api/__contract/created'), 'envelope-created');
});

test('contract: shared envelope accepted', function () {
    Route::post('/api/__contract/accepted', fn () => ApiResponse::accepted());

    ResponseSnapshot::assertMatches($this->postJson('/api/__contract/accepted'), 'envelope-accepted');
});

test('contract: shared envelope no content', function () {
    Route::delete('/api/__contract/no-content', fn () => ApiResponse::noContent());

    ResponseSnapshot::assertMatches($this->deleteJson('/api/__contract/no-content'), 'envelope-no-content');
});

test('contract: shared envelope cursor page with both cursors', function () {
    Route::get('/api/__contract/cursor-middle', function () {
        // 3 элемента при perPage=2 → hasMore, курсор «вперёд» → есть и next, и prev.
        $page = new CursorPaginator(contractPageItems(3), 2, new Cursor(['id' => 0], true), ['parameters' => ['id']]);

        return ApiResponse::cursorPage($page);
    });

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/cursor-middle'), 'envelope-cursor-page-middle');
});

test('contract: shared envelope cursor page first page without cursors', function () {
    Route::get('/api/__contract/cursor-first', function () {
        // Первая страница, элементов меньше perPage → оба курсора null.
        $page = new CursorPaginator(contractPageItems(2), 5, null, ['parameters' => ['id']]);

        return ApiResponse::cursorPage($page);
    });

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/cursor-first'), 'envelope-cursor-page-first');
});

test('contract: shared envelope cursor page empty', function () {
    Route::get('/api/__contract/cursor-empty', function () {
        $page = new CursorPaginator([], 15, null, ['parameters' => ['id']]);

        return ApiResponse::cursorPage($page);
    });

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/cursor-empty'), 'envelope-cursor-page-empty');
});

test('contract: shared envelope cursor page with mapper', function () {
    Route::get('/api/__contract/cursor-mapped', function () {
        $page = new CursorPaginator(contractPageItems(3), 2, new Cursor(['id' => 0], true), ['parameters' => ['id']]);

        return ApiResponse::cursorPage($page, static fn (array $item): array => [
            'id' => $item['id'],
            'label' => strtoupper($item['title']),
        ]);
    });

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/cursor-mapped'), 'envelope-cursor-page-mapped');
});

test('contract: shared error envelope validation', function () {
    Route::post(
        '/api/__contract/error-validation',
        fn () => ErrorEnvelope::validation(['email' => ['The email field is required.'], 'name' => ['The name field is required.']]),
    );

    ResponseSnapshot::assertMatches($this->postJson('/api/__contract/error-validation'), 'error-validation');
});

test('contract: shared error envelope validation without details', function () {
    Route::post('/api/__contract/error-validation-empty', fn () => ErrorEnvelope::validation([]));

    ResponseSnapshot::assertMatches($this->postJson('/api/__contract/error-validation-empty'), 'error-validation-empty-details');
});

test('contract: shared error envelope validation from a thrown exception', function () {
    Route::post('/api/__contract/validate', function (Request $request) {
        $request->validate([
            'email' => ['required', 'email'],
            'age' => ['required', 'integer', 'min:18'],
        ]);

        return ApiResponse::data(['ok' => true]);
    });

    $response = $this->postJson('/api/__contract/validate', ['email' => 'not-an-email']);

    ResponseSnapshot::assertMatches($response, 'error-validation-thrown');
});

test('contract: shared error envelope not found', function () {
    Route::get('/api/__contract/error-not-found', fn () => ErrorEnvelope::notFound());
    Route::get('/api/__contract/error-not-found-custom', fn () => ErrorEnvelope::notFound('Project not found.'));

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/error-not-found'), 'error-not-found');
    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/error-not-found-custom'), 'error-not-found-custom-message');
});

test('contract: shared error envelope unauthorized', function () {
    Route::get('/api/__contract/error-unauthorized', fn () => ErrorEnvelope::unauthorized());
    Route::get('/api/__contract/error-unauthorized-custom', fn () => ErrorEnvelope::unauthorized('Service token required.'));

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/error-unauthorized'), 'error-unauthorized');
    ResponseSnapshot::assertMatches(
        $this->getJson('/api/__contract/error-unauthorized-custom'),
        'error-unauthorized-custom-message',
    );
});

test('contract: shared error envelope forbidden', function () {
    Route::get('/api/__contract/error-forbidden', fn () => ErrorEnvelope::forbidden());
    Route::get('/api/__contract/error-forbidden-custom', fn () => ErrorEnvelope::forbidden('Missing permission auth.users.view.'));

    ResponseSnapshot::assertMatches($this->getJson('/api/__contract/error-forbidden'), 'error-forbidden');
    ResponseSnapshot::assertMatches(
        $this->getJson('/api/__contract/error-forbidden-custom'),
        'error-forbidden-custom-message',
    );
});

test('contract: shared error envelope too many attempts', function () {
    Route::post(
        '/api/__contract/error-throttled',
        fn () => ErrorEnvelope::respond('too_many_attempts', 'Too many attempts.', 429),
    );

    ResponseSnapshot::assertMatches($this->postJson('/api/__contract/error-throttled'), 'error-too-many-attempts');
});

test('contract: shared error envelope with details and explicit trace id', function () {
    Route::post('/api/__contract/error-details', fn () => ErrorEnvelope::respond(
        'payment_declined',
        'Payment declined by provider.',
        402,
        ['provider' => 'platega', 'reason' => 'insufficient_funds'],
        'trace-fixed-1',
    ));

    ResponseSnapshot::assertMatches($this->postJson('/api/__contract/error-details'), 'error-respond-with-details');
});
