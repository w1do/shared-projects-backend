<?php

declare(strict_types=1);

use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Характеризационные снимки admin-контракта cms/instructs: список, категории,
 * создание, правка, удаление и отказы (403 без права, 422 на непригодной схеме).
 */
const INSTRUCTS_CONTRACT_PERMS = ['content.instructs.view', 'content.instructs.manage'];

function instructContractHeaders(array $permissions = INSTRUCTS_CONTRACT_PERMS): array
{
    return actingAsContentOperator('proj-1', $permissions);
}

/** @param array<string, mixed> $overrides */
function instructContractPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Темы для автоблога',
        'category' => InstructCategory::PostTopics->value,
        'rule' => 'Собери 10 тем по материалам ресёрча',
        'schema' => [
            'type' => 'object',
            'properties' => ['topics' => ['type' => 'array', 'items' => ['type' => 'string']]],
            'required' => ['topics'],
        ],
    ], $overrides);
}

function seedInstructContractFixtures(): void
{
    app(ProjectContext::class)->set('proj-1');
    app(SystemInstructSeeder::class)->seed();
}

test('contract: instructs index lists project and system instructs', function () {
    seedInstructContractFixtures();

    $this->postJson('/api/admin/v1/projects/proj-1/content/instructs', instructContractPayload(), instructContractHeaders())
        ->assertCreated();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/instructs', instructContractHeaders());

    ResponseSnapshot::assertMatches($response, 'instructs-index');
});

test('contract: instructs index filtered by category', function () {
    seedInstructContractFixtures();

    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/instructs?category='.InstructCategory::PostBody->value,
        instructContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-index-category');
});

test('contract: instructs categories catalogue', function () {
    $response = $this->getJson('/api/admin/v1/projects/proj-1/content/instructs/categories', instructContractHeaders());

    ResponseSnapshot::assertMatches($response, 'instructs-categories');
});

test('contract: instructs store', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/instructs',
        instructContractPayload(),
        instructContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-store');
});

test('contract: instructs update', function () {
    $id = $this->postJson('/api/admin/v1/projects/proj-1/content/instructs', instructContractPayload(), instructContractHeaders())
        ->json('data.id');

    $response = $this->putJson(
        "/api/admin/v1/projects/proj-1/content/instructs/{$id}",
        instructContractPayload(['title' => 'Темы для автоблога v2', 'published' => true]),
        instructContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-update');
});

test('contract: instructs destroy', function () {
    $id = $this->postJson('/api/admin/v1/projects/proj-1/content/instructs', instructContractPayload(), instructContractHeaders())
        ->json('data.id');

    $response = $this->deleteJson("/api/admin/v1/projects/proj-1/content/instructs/{$id}", [], instructContractHeaders());

    ResponseSnapshot::assertMatches($response, 'instructs-destroy');
});

test('contract: instructs store rejected without the manage permission', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/instructs',
        instructContractPayload(),
        instructContractHeaders(['content.instructs.view']),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-store-403');
});

test('contract: instructs index rejected without the view permission', function () {
    $response = $this->getJson(
        '/api/admin/v1/projects/proj-1/content/instructs',
        instructContractHeaders(['content.posts.view']),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-index-403');
});

test('contract: instructs store with an unsupported schema', function () {
    $response = $this->postJson(
        '/api/admin/v1/projects/proj-1/content/instructs',
        instructContractPayload(['schema' => ['type' => 'object', 'properties' => ['x' => ['type' => 'unicorn']]]]),
        instructContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-store-422-schema');
});

test('contract: instructs update of a system instruct is refused', function () {
    seedInstructContractFixtures();

    $id = collect($this->getJson('/api/admin/v1/projects/proj-1/content/instructs', instructContractHeaders())->json('data'))
        ->firstWhere('is_system', true)['id'];

    $response = $this->putJson(
        "/api/admin/v1/projects/proj-1/content/instructs/{$id}",
        instructContractPayload(['title' => 'Подмена']),
        instructContractHeaders(),
    );

    ResponseSnapshot::assertMatches($response, 'instructs-update-422-system');
});

test('contract: content instructs schema presets', function () {
    ResponseSnapshot::assertMatches(
        $this->getJson(
            '/api/admin/v1/projects/proj-1/content/instructs/schema-presets',
            actingAsContentOperator('proj-1', ['content.instructs.view']),
        ),
        'instructs-schema-presets',
    );
});

test('contract: content instructs schema presets forbidden', function () {
    ResponseSnapshot::assertMatches(
        $this->getJson(
            '/api/admin/v1/projects/proj-1/content/instructs/schema-presets',
            actingAsContentOperator('proj-1', ['content.posts.view']),
        ),
        'instructs-schema-presets-403',
    );
});
