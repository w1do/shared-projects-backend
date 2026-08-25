<?php

declare(strict_types=1);

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Translate\TranslateResultDTO;
use Cms\Ai\Application\Exceptions\AiRequestException;
use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\Jobs\TranslateMissingJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Bus;

const T_PERMS = [
    'content.translations.view', 'content.translations.manage',
];

function translationHeaders(array $permissions = T_PERMS): array
{
    return actingAsContentOperator('proj-1', array_merge($permissions, ['content.posts.view']));
}

test('translation key stores values per locale and reads them back', function () {
    $headers = translationHeaders();

    $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['en' => 'Categories', 'ru' => 'Категории'],
    ], $headers)->assertCreated();

    $this->getJson('/api/admin/v1/projects/proj-1/content/translations', $headers)
        ->assertOk()
        ->assertJsonPath('data.0.key', 'nav.categories')
        ->assertJsonPath('data.0.values.ru', 'Категории');
});

test('unknown locale is rejected with 422', function () {
    $headers = translationHeaders();

    $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'nav.categories',
        'values' => ['de' => 'Kategorien'],
    ], $headers)->assertStatus(422);

    expect(Translation::query()->count())->toBe(0);
});

test('updating one locale keeps the others intact', function () {
    $headers = translationHeaders();
    app(ProjectContext::class)->set('proj-1');
    $t = Translation::create(['key' => 'nav.blogs', 'values' => ['en' => 'Blogs', 'ru' => 'Блоги']]);

    $this->putJson("/api/admin/v1/projects/proj-1/content/translations/{$t->id}", [
        'key' => 'nav.blogs', 'values' => ['ru' => 'Журнал'],
    ], $headers)->assertOk();

    $t->refresh();
    expect($t->values)->toBe(['en' => 'Blogs', 'ru' => 'Журнал']);
});

test('update keeps the key of the found record and creates no second row', function () {
    // Б4: PUT — это update, присланный key игнорируется; запись остаётся одна.
    $headers = translationHeaders();
    app(ProjectContext::class)->set('proj-1');
    $t = Translation::create(['key' => 'nav.keep', 'values' => ['en' => 'Keep']]);

    $this->putJson("/api/admin/v1/projects/proj-1/content/translations/{$t->id}", [
        'key' => 'nav.other', 'values' => ['ru' => 'Оставить'],
    ], $headers)->assertOk();

    expect(Translation::query()->count())->toBe(1)
        ->and($t->refresh()->key)->toBe('nav.keep')
        ->and($t->values)->toBe(['en' => 'Keep', 'ru' => 'Оставить']);
});

test('operator without manage permission cannot change the dictionary', function () {
    $headers = translationHeaders(['content.translations.view']);

    $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'x', 'values' => ['en' => 'X'],
    ], $headers)->assertStatus(403);
});

test('locale dictionary endpoint returns flat map with default-locale fallback', function () {
    $headers = translationHeaders();
    app(ProjectContext::class)->set('proj-1');
    Translation::create(['key' => 'a', 'values' => ['en' => 'A', 'ru' => 'А']]);
    Translation::create(['key' => 'b', 'values' => ['en' => 'B']]); // ru нет — откат на en

    $this->getJson('/api/admin/v1/projects/proj-1/content/translations?locale=ru', $headers)
        ->assertOk()
        ->assertJson(['data' => ['a' => 'А', 'b' => 'B']]);
});

test('dictionary writes bump the translations version', function () {
    $headers = translationHeaders();
    $version = fn () => (int) cache()->get('translations:version:proj-1', 1);
    $before = $version();

    $this->postJson('/api/admin/v1/projects/proj-1/content/translations', [
        'key' => 'v', 'values' => ['en' => 'V'],
    ], $headers)->assertCreated();

    expect($version())->toBeGreaterThan($before);
});

test('translate-missing fills only missing locales and marks them machine', function () {
    app(ProjectContext::class)->set('proj-1');
    $t = Translation::create(['key' => 'nav.team', 'values' => ['en' => 'Team']]);

    app()->instance(AiOperations::class, new class implements AiOperations
    {
        public int $calls = 0;

        public function translate($request): TranslateResultDTO
        {
            $this->calls++;

            return new TranslateResultDTO(translations: ['nav.team' => ['ru' => 'Команда']]);
        }

        public function rewrite($r): never
        {
            throw new RuntimeException('unused');
        }

        public function normalize($r): never
        {
            throw new RuntimeException('unused');
        }

        public function suggestCategories($r): never
        {
            throw new RuntimeException('unused');
        }

        public function generatePost($r): never
        {
            throw new RuntimeException('unused');
        }
    });

    app()->call([new TranslateMissingJob('proj-1', ['en', 'ru'], 'en'), 'handle']);

    $t->refresh();
    expect($t->values)->toBe(['en' => 'Team', 'ru' => 'Команда'])
        ->and($t->machine)->toBe(['ru' => true]);

    // повторный запуск: всё заполнено — провайдер не вызывается
    $ai = app(AiOperations::class);
    app()->call([new TranslateMissingJob('proj-1', ['en', 'ru'], 'en'), 'handle']);
    expect($ai->calls)->toBe(1);
});

test('manual edit clears the machine flag', function () {
    $headers = translationHeaders();
    app(ProjectContext::class)->set('proj-1');
    $t = Translation::create(['key' => 'nav.x', 'values' => ['en' => 'X', 'ru' => 'Икс'], 'machine' => ['ru' => true]]);

    $this->putJson("/api/admin/v1/projects/proj-1/content/translations/{$t->id}", [
        'key' => 'nav.x', 'values' => ['ru' => 'Икс!'],
    ], $headers)->assertOk()->assertJsonPath('data.machine', []);

    expect($t->refresh()->machine)->toBe([]);
});

test('ai failure leaves records unchanged', function () {
    app(ProjectContext::class)->set('proj-1');
    $t = Translation::create(['key' => 'nav.fail', 'values' => ['en' => 'Fail']]);

    app()->instance(AiOperations::class, new class implements AiOperations
    {
        public function translate($request): never
        {
            throw new AiRequestException('provider down');
        }

        public function rewrite($r): never
        {
            throw new RuntimeException('unused');
        }

        public function normalize($r): never
        {
            throw new RuntimeException('unused');
        }

        public function suggestCategories($r): never
        {
            throw new RuntimeException('unused');
        }

        public function generatePost($r): never
        {
            throw new RuntimeException('unused');
        }
    });

    try {
        app()->call([new TranslateMissingJob('proj-1', ['en', 'ru'], 'en'), 'handle']);
        $this->fail('expected AiRequestException');
    } catch (AiRequestException) {
    }

    expect($t->refresh()->values)->toBe(['en' => 'Fail'])
        ->and($t->machine)->toBe([]);
});

test('translate-missing endpoint queues the job and requires manage permission', function () {
    Bus::fake();
    $headers = translationHeaders();

    $this->postJson('/api/admin/v1/projects/proj-1/content/translations/translate-missing', [], $headers)
        ->assertStatus(202);
    Bus::assertDispatched(TranslateMissingJob::class, fn ($job) => $job->projectId === 'proj-1' && $job->targetLocales === ['en', 'ru']);

    $viewOnly = translationHeaders(['content.translations.view']);
    $this->postJson('/api/admin/v1/projects/proj-1/content/translations/translate-missing', [], $viewOnly)
        ->assertStatus(403);
});

test('translate-missing normalizes ids for the job and keeps accepting loose input', function () {
    Bus::fake();
    $headers = translationHeaders();
    app(ProjectContext::class)->set('proj-1');
    $t = Translation::create(['key' => 'nav.ids', 'values' => ['en' => 'Ids']]);

    $this->postJson('/api/admin/v1/projects/proj-1/content/translations/translate-missing', [
        'ids' => [(string) $t->id],
    ], $headers)->assertStatus(202);
    Bus::assertDispatched(TranslateMissingJob::class, fn ($job) => $job->ids === [$t->id]);

    // Контракт приёма не сужается: ids не массив — это «весь словарь», а не 422.
    $this->postJson('/api/admin/v1/projects/proj-1/content/translations/translate-missing', [
        'ids' => 'not-an-array',
    ], $headers)->assertStatus(202);
    Bus::assertDispatched(TranslateMissingJob::class, fn ($job) => $job->ids === null);
});
