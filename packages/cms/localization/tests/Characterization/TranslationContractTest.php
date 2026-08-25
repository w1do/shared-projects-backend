<?php

declare(strict_types=1);

use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\Jobs\TranslateMissingJob;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Bus;

/**
 * Характеризационные снимки admin-контракта cms/localization.
 * Покрыты все 5 маршрутов routes/admin.php: index (полные записи и словарь по locale),
 * store, update, destroy, translate-missing — успешные ответы и достижимые ветки ошибок.
 *
 * Все фикстуры заданы явными атрибутами: фабрик у Translation нет, faker не участвует,
 * поэтому снимки воспроизводимы от прогона к прогону.
 */
const LOCALIZATION_CONTRACT_PERMS = ['content.translations.view', 'content.translations.manage'];

/** Заголовки оператора проекта proj-1 с локалями en/ru. */
function localizationContractHeaders(
    array $permissions = LOCALIZATION_CONTRACT_PERMS,
    array $services = ['content'],
): array {
    return actingAsContentOperator('proj-1', $permissions, $services, ['en', 'ru']);
}

/** Детерминированный словарь: три записи с фиксированными значениями. */
function seedLocalizationContractDictionary(): Translation
{
    app(ProjectContext::class)->set('proj-1');

    $withBoth = Translation::create([
        'key' => 'nav.categories',
        'values' => ['en' => 'Categories', 'ru' => 'Категории'],
        'machine' => ['ru' => true],
    ]);

    // ru отсутствует — в словаре сработает откат на локаль по умолчанию
    Translation::create(['key' => 'nav.blogs', 'values' => ['en' => 'Blogs']]);

    // значений нет вовсе — ключ выпадает из словаря
    Translation::create(['key' => 'nav.empty', 'values' => []]);

    return $withBoth;
}

// --- GET translations -------------------------------------------------------

test('contract: localization translations index full records', function () {
    seedLocalizationContractDictionary();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index');
});

test('contract: localization translations index empty', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-empty');
});

test('contract: localization translations index dictionary by locale', function () {
    seedLocalizationContractDictionary();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations?locale=ru',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-locale-ru');
});

test('contract: localization translations index dictionary default locale', function () {
    seedLocalizationContractDictionary();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations?locale=en',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-locale-en');
});

test('contract: localization translations index dictionary unknown locale', function () {
    seedLocalizationContractDictionary();

    // locale вне объявленных у проекта: словарь всё равно строится, откат на en
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations?locale=de',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-locale-unknown');
});

test('contract: localization translations index dictionary empty', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations?locale=ru',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-locale-empty');
});

test('contract: localization translations index blank locale falls back to records', function () {
    seedLocalizationContractDictionary();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations?locale=',
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-locale-blank');
});

test('contract: localization translations index unauthenticated', function () {
    localizationContractHeaders();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/translations');

    ResponseSnapshot::assertMatches($response, 'translations-index-401');
});

test('contract: localization translations index forbidden', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations',
        localizationContractHeaders(['content.posts.view']),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-403');
});

test('contract: localization translations index service disabled', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/translations',
        localizationContractHeaders(LOCALIZATION_CONTRACT_PERMS, ['analytics']),
    );

    ResponseSnapshot::assertMatches($response, 'translations-index-404-service-disabled');
});

// --- POST translations ------------------------------------------------------

test('contract: localization translations store created', function () {
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['en' => 'Categories', 'ru' => 'Категории'],
    ], localizationContractHeaders());

    ResponseSnapshot::assertMatches($response, 'translations-store-201');
});

test('contract: localization translations store upserts existing key', function () {
    $headers = localizationContractHeaders();
    seedLocalizationContractDictionary();

    // тот же key: значения сливаются, ручная правка снимает пометку machine
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['ru' => 'Рубрики'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'translations-store-upsert');
});

test('contract: localization translations store validation missing fields', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations',
        [],
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-store-422-missing');
});

test('contract: localization translations store validation empty values', function () {
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => [],
    ], localizationContractHeaders());

    ResponseSnapshot::assertMatches($response, 'translations-store-422-empty-values');
});

test('contract: localization translations store validation unknown locale', function () {
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['de' => 'Kategorien'],
    ], localizationContractHeaders());

    ResponseSnapshot::assertMatches($response, 'translations-store-422-unknown-locale');
});

test('contract: localization translations store validation bad types', function () {
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => str_repeat('k', 256),
        'values' => ['en' => 42],
    ], localizationContractHeaders());

    ResponseSnapshot::assertMatches($response, 'translations-store-422-bad-types');
});

test('contract: localization translations store validation values not array', function () {
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => 'Categories',
    ], localizationContractHeaders());

    ResponseSnapshot::assertMatches($response, 'translations-store-422-values-scalar');
});

test('contract: localization translations store forbidden', function () {
    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['en' => 'Categories'],
    ], localizationContractHeaders(['content.translations.view']));

    ResponseSnapshot::assertMatches($response, 'translations-store-403');
});

test('contract: localization translations store unauthenticated', function () {
    localizationContractHeaders();

    $response = $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['en' => 'Categories'],
    ]);

    ResponseSnapshot::assertMatches($response, 'translations-store-401');
});

// --- PUT translations/{translation} -----------------------------------------

test('contract: localization translations update ok', function () {
    $headers = localizationContractHeaders();
    $translation = seedLocalizationContractDictionary();

    // key из тела игнорируется — берётся key существующей записи
    $response = $this->putJson("/api/admin/v1/projects/proj-1/content/translations/{$translation->id}", [
        'key' => 'ignored.key',
        'values' => ['ru' => 'Рубрики'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'translations-update-200');
});

test('contract: localization translations update not found', function () {
    $response = $this->putJson('/api/admin/v1/projects/proj-1/content/translations/999999', [
        'key' => 'nav.categories',
        'values' => ['ru' => 'Рубрики'],
    ], localizationContractHeaders());

    ResponseSnapshot::assertMatches($response, 'translations-update-404');
});

test('contract: localization translations update validation error', function () {
    $headers = localizationContractHeaders();
    $translation = seedLocalizationContractDictionary();

    // валидация FormRequest срабатывает раньше поиска записи
    $response = $this->putJson("/api/admin/v1/projects/proj-1/content/translations/{$translation->id}", [
        'values' => ['de' => 'Kategorien'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'translations-update-422');
});

test('contract: localization translations update forbidden', function () {
    $headers = localizationContractHeaders(['content.translations.view']);

    $response = $this->putJson('/api/admin/v1/projects/proj-1/content/translations/1', [
        'key' => 'nav.categories',
        'values' => ['ru' => 'Рубрики'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'translations-update-403');
});

// --- DELETE translations/{translation} --------------------------------------

test('contract: localization translations destroy no content', function () {
    $headers = localizationContractHeaders();
    $translation = seedLocalizationContractDictionary();

    $response = $this->deleteJson(
        "/api/admin/v1/projects/proj-1/content/translations/{$translation->id}",
        [],
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'translations-destroy-204');
});

test('contract: localization translations destroy not found', function () {
    $response = $this->deleteJson(
        '/api/admin/v1/projects/proj-1/content/translations/999999',
        [],
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translations-destroy-404');
});

test('contract: localization translations destroy forbidden', function () {
    $response = $this->deleteJson(
        '/api/admin/v1/projects/proj-1/content/translations/1',
        [],
        localizationContractHeaders(['content.translations.view']),
    );

    ResponseSnapshot::assertMatches($response, 'translations-destroy-403');
});

// --- POST translations/translate-missing ------------------------------------

test('contract: localization translate-missing accepted', function () {
    Bus::fake();
    seedLocalizationContractDictionary();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        [],
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translate-missing-202');
    Bus::assertDispatched(TranslateMissingJob::class);
});

test('contract: localization translate-missing accepted with ids', function () {
    Bus::fake();
    $headers = localizationContractHeaders();
    $translation = seedLocalizationContractDictionary();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        ['ids' => [$translation->id]],
        $headers,
    );

    ResponseSnapshot::assertMatches($response, 'translate-missing-202-with-ids');
});

test('contract: localization translate-missing accepted with missing ids', function () {
    Bus::fake();

    // несуществующие id не валидируются и не проверяются — фиксируем как есть
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        ['ids' => [999999]],
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'translate-missing-202-missing-ids');
});

test('contract: localization translate-missing accepted with invalid ids', function () {
    Bus::fake();

    // ids не массив и элементы не числа — валидации нет, ответ тот же 202
    $scalar = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        ['ids' => 'not-an-array'],
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($scalar, 'translate-missing-202-ids-scalar');

    $garbage = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        ['ids' => ['abc', null]],
        localizationContractHeaders(),
    );

    ResponseSnapshot::assertMatches($garbage, 'translate-missing-202-ids-garbage');
});

test('contract: localization translate-missing forbidden', function () {
    Bus::fake();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        [],
        localizationContractHeaders(['content.translations.view']),
    );

    ResponseSnapshot::assertMatches($response, 'translate-missing-403');
});

test('contract: localization translate-missing unauthenticated', function () {
    Bus::fake();
    localizationContractHeaders();

    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/translations/translate-missing',
        [],
    );

    ResponseSnapshot::assertMatches($response, 'translate-missing-401');
});
