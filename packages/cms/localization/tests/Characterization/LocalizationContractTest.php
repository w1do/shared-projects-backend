<?php

declare(strict_types=1);

use Cms\Localization\Domain\Models\Localization;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Характеризационные снимки admin-контракта реестра локализаций:
 * GET localizations — полный список, фильтр по сервису, пустой список, 403.
 *
 * Фикстуры заданы явными строками (не enum-реестром), чтобы снимок
 * не менялся при добавлении новых ключей в cms/contracts.
 */

/** Заголовки оператора проекта proj-1 с правом просмотра переводов. */
function localizationRegistryHeaders(array $permissions = ['content.translations.view']): array
{
    return actingAsContentOperator('proj-1', $permissions);
}

/** Детерминированные строки реестра: с переопределением и без. */
function seedLocalizationRegistryRows(): void
{
    app(ProjectContext::class)->set('proj-1');

    Localization::create([
        'service' => 'content',
        'key' => 'nav.content.posts',
        'locale' => 'ru',
        'value' => null,
        'default_value' => 'Посты',
    ]);

    Localization::create([
        'service' => 'pay',
        'key' => 'nav.pay.plans',
        'locale' => 'ru',
        'value' => 'Тарифы',
        'default_value' => 'Планы',
    ]);
}

test('contract: localization registry index', function () {
    seedLocalizationRegistryRows();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/localizations',
        localizationRegistryHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'localizations-index');
});

test('contract: localization registry index filtered by service', function () {
    seedLocalizationRegistryRows();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/localizations?service=pay',
        localizationRegistryHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'localizations-index-service-filter');
});

test('contract: localization registry index empty', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/localizations',
        localizationRegistryHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'localizations-index-empty');
});

test('contract: localization registry index without permission is 403', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/localizations',
        localizationRegistryHeaders(permissions: []),
    );

    ResponseSnapshot::assertMatches($response, 'localizations-index-403');
});
