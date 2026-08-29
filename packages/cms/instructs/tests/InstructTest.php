<?php

declare(strict_types=1);

use Cms\Instructs\Application\Actions\RecordInstructUsageAction;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Application\Commands\DeleteInstructCommand;
use Cms\Instructs\Application\Commands\UpsertInstructCommand;
use Cms\Instructs\Application\DTOs\Instruct\UpsertInstructDTO;
use Cms\Instructs\Application\Exceptions\InstructRuleViolation;
use Cms\Instructs\Application\Handlers\DeleteInstructHandler;
use Cms\Instructs\Application\Handlers\UpsertInstructHandler;
use Cms\Instructs\Application\Queries\ListInstructsQuery;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Instructs\Domain\Models\InstructUsage;
use Cms\Instructs\Infrastructure\Persistence\InstructProjectScope;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructCatalog;
use Cms\Instructs\Infrastructure\Persistence\SystemInstructSeeder;
use Cms\Shared\Tenant\ProjectContext;

/** @param array<string, mixed> $overrides */
function instructPayload(array $overrides = []): array
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
        'published' => false,
    ], $overrides);
}

function upsertInstruct(array $overrides = [], ?int $instructId = null): Instruct
{
    return app(UpsertInstructHandler::class)->handle(new UpsertInstructCommand(
        UpsertInstructDTO::fromValidated(instructPayload($overrides)),
        instructId: $instructId,
    ));
}

/** Системная инструкция кладётся мимо scope: у неё нет проекта. */
function seedSystemInstructs(): void
{
    app(SystemInstructSeeder::class)->seed();
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
});

test('instruct list is scoped to the project and keeps system instructs visible', function () {
    seedSystemInstructs();
    upsertInstruct(['title' => 'Своя инструкция']);

    app(ProjectContext::class)->set('proj-2');
    $other = app(ListInstructsQuery::class)->handle();

    expect(array_map(fn ($dto) => $dto->title, $other))
        ->not->toContain('Своя инструкция')
        ->and(array_filter($other, fn ($dto) => $dto->is_system))->not->toBeEmpty();

    app(ProjectContext::class)->set('proj-1');
    $own = app(ListInstructsQuery::class)->handle();

    expect(array_map(fn ($dto) => $dto->title, $own))->toContain('Своя инструкция');
});

test('instruct of another project is not readable', function () {
    $instruct = upsertInstruct();

    app(ProjectContext::class)->set('proj-2');

    expect(Instruct::query()->whereKey($instruct->getKey())->first())->toBeNull();
});

test('category outside the platform list is rejected', function () {
    upsertInstruct(['category' => 'newsletter']);
})->throws(InstructRuleViolation::class);

test('schema that is not a supported json schema is rejected', function () {
    upsertInstruct(['schema' => ['type' => 'object', 'properties' => ['x' => ['type' => 'unicorn']]]]);
})->throws(InstructRuleViolation::class);

test('schema without properties is rejected and nothing is stored', function () {
    try {
        upsertInstruct(['schema' => ['type' => 'object']]);
        $this->fail('expected InstructRuleViolation');
    } catch (InstructRuleViolation) {
        expect(Instruct::query()->where('is_system', false)->count())->toBe(0);
    }
});

test('system instruct cannot be updated or deleted', function () {
    seedSystemInstructs();

    $system = Instruct::query()->where('is_system', true)->firstOrFail();

    try {
        upsertInstruct(['title' => 'Подмена'], instructId: (int) $system->getKey());
        $this->fail('expected InstructRuleViolation on update');
    } catch (InstructRuleViolation) {
        expect($system->fresh()?->title)->not->toBe('Подмена');
    }

    try {
        app(DeleteInstructHandler::class)->handle(new DeleteInstructCommand((int) $system->getKey()));
        $this->fail('expected InstructRuleViolation on delete');
    } catch (InstructRuleViolation) {
        expect($system->fresh())->not->toBeNull();
    }
});

test('own instruct is deleted softly', function () {
    $instruct = upsertInstruct();

    app(DeleteInstructHandler::class)->handle(new DeleteInstructCommand((int) $instruct->getKey()));

    expect(Instruct::query()->whereKey($instruct->getKey())->first())->toBeNull()
        ->and(Instruct::withTrashed()->whereKey($instruct->getKey())->first())->not->toBeNull();
});

test('publishing an instruct unpublishes the others of the same category', function () {
    $first = upsertInstruct(['title' => 'Первая', 'published' => true]);
    $second = upsertInstruct(['title' => 'Вторая', 'published' => true]);

    expect($first->fresh()?->published)->toBeFalse()
        ->and($second->fresh()?->published)->toBeTrue();
});

test('resolve prefers a published project instruct over the system one', function () {
    seedSystemInstructs();

    $own = upsertInstruct(['title' => 'Своя опубликованная', 'published' => true]);

    $resolved = app(ResolveInstructAction::class)->handle(InstructCategory::PostTopics);

    expect($resolved->getKey())->toBe($own->getKey());
});

test('resolve falls back to the system instruct when the project has none published', function () {
    seedSystemInstructs();
    upsertInstruct(['title' => 'Черновик', 'published' => false]);

    $resolved = app(ResolveInstructAction::class)->handle(InstructCategory::PostTopics);

    expect($resolved->is_system)->toBeTrue();
});

test('usage snapshot survives editing and deleting the instruct', function () {
    $instruct = upsertInstruct(['rule' => 'Исходное правило']);

    $usage = app(RecordInstructUsageAction::class)->handle($instruct);

    upsertInstruct(['rule' => 'Изменённое правило'], instructId: (int) $instruct->getKey());
    app(DeleteInstructHandler::class)->handle(new DeleteInstructCommand((int) $instruct->getKey()));

    $stored = InstructUsage::query()->whereKey($usage->getKey())->firstOrFail();

    expect($stored->rule_snapshot)->toBe('Исходное правило')
        ->and($stored->title_snapshot)->toBe('Темы для автоблога')
        ->and($stored->instruct->getKey())->toBe($instruct->getKey());
});

test('seeding system instructs twice creates no duplicates', function () {
    seedSystemInstructs();
    seedSystemInstructs();

    $count = Instruct::withoutGlobalScope(InstructProjectScope::class)->where('is_system', true)->count();

    expect($count)->toBe(count(SystemInstructCatalog::all()));
});

test('every system instruct schema is accepted by the compiler', function () {
    foreach (SystemInstructCatalog::all() as $definition) {
        upsertInstruct([
            'title' => $definition['title'],
            'category' => $definition['category']->value,
            'rule' => $definition['rule'],
            'schema' => $definition['schema'],
        ]);
    }

    expect(Instruct::query()->where('is_system', false)->count())->toBe(count(SystemInstructCatalog::all()));
});
