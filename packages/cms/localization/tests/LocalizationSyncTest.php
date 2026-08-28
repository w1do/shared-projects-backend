<?php

declare(strict_types=1);

use Cms\Contracts\Localization\AnalyticsLocalizationKeys;
use Cms\Contracts\Localization\ContentLocalizationKeys;
use Cms\Contracts\Localization\PayLocalizationKeys;
use Cms\Localization\Application\Commands\SyncLocalizationsCommand;
use Cms\Localization\Application\Handlers\SyncLocalizationsHandler;
use Cms\Localization\Domain\Contracts\LocalizationReader;
use Cms\Localization\Domain\Contracts\LocalizePort;
use Cms\Localization\Domain\Models\Localization;
use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\Persistence\LocalizeRegistry;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Console\Scheduling\Schedule;

/** Все ключи enum-реестров cms/contracts (content + analytics + pay). */
function registeredLocalizationKeysCount(): int
{
    return count(ContentLocalizationKeys::entries())
        + count(AnalyticsLocalizationKeys::entries())
        + count(PayLocalizationKeys::entries());
}

test('registry stores registered keys; re-registration overwrites the value', function () {
    $registry = new LocalizeRegistry;
    $registry->register('content', 'ru', ['nav.a' => 'А', 'nav.b' => 'Б']);
    $registry->register('content', 'ru', ['nav.b' => 'Б2']);

    expect($registry->all())->toHaveCount(2)
        ->and($registry->defaultValue('content', 'nav.b', 'ru'))->toBe('Б2')
        ->and($registry->defaultValue('content', 'missing', 'ru'))->toBeNull();
});

test('provider builds the registry from contracts enums of all services', function () {
    $registry = app(LocalizePort::class);

    expect($registry->all())->toHaveCount(registeredLocalizationKeysCount())
        ->and($registry->defaultValue('content', ContentLocalizationKeys::NavPosts->value, 'ru'))->toBe('Посты')
        ->and($registry->defaultValue('analytics', AnalyticsLocalizationKeys::NavOverview->value, 'ru'))->toBe('Аналитика')
        ->and($registry->defaultValue('pay', PayLocalizationKeys::NavPlans->value, 'ru'))->toBe('Планы');
});

test('localize:sync inserts keys of all services and reports counts', function () {
    $total = registeredLocalizationKeysCount();

    $this->artisan('localize:sync', ['--project' => ['proj-1']])
        ->expectsOutputToContain("added {$total}, updated 0, unchanged 0 (projects: 1)")
        ->assertSuccessful();

    expect(Localization::acrossProjects()->where('project_id', 'proj-1')->count())->toBe($total)
        ->and(Localization::acrossProjects()->where('project_id', 'proj-1')->where('service', 'pay')->count())
        ->toBe(count(PayLocalizationKeys::entries()));
});

test('localize:sync is idempotent: a repeated run changes nothing', function () {
    $total = registeredLocalizationKeysCount();

    $this->artisan('localize:sync', ['--project' => ['proj-1']])->assertSuccessful();
    $this->artisan('localize:sync', ['--project' => ['proj-1']])
        ->expectsOutputToContain("added 0, updated 0, unchanged {$total} (projects: 1)")
        ->assertSuccessful();

    expect(Localization::acrossProjects()->where('project_id', 'proj-1')->count())->toBe($total);
});

test('sync updates a changed default but never touches the admin override', function () {
    $this->artisan('localize:sync', ['--project' => ['proj-1']])->assertSuccessful();

    $row = Localization::acrossProjects()
        ->where('project_id', 'proj-1')
        ->where('key', ContentLocalizationKeys::NavPosts->value)
        ->firstOrFail();
    $row->value = 'Моё название';
    $row->save();

    // Симуляция изменения кода: реестр с другим значением по умолчанию.
    $registry = new LocalizeRegistry;
    $registry->register('content', 'ru', [ContentLocalizationKeys::NavPosts->value => 'Записи']);

    $report = (new SyncLocalizationsHandler($registry))->handle(new SyncLocalizationsCommand(['proj-1']));

    expect($report->added)->toBe(0)
        ->and($report->updated)->toBe(1)
        ->and($row->refresh()->default_value)->toBe('Записи')
        ->and($row->value)->toBe('Моё название');
});

test('sync without projects covers every project id known to content-service', function () {
    Translation::create(['project_id' => 'proj-1', 'key' => 'x', 'values' => ['en' => 'X']]);
    Translation::create(['project_id' => 'proj-2', 'key' => 'x', 'values' => ['en' => 'X']]);

    $this->artisan('localize:sync')
        ->expectsOutputToContain('(projects: 2)')
        ->assertSuccessful();

    expect(Localization::acrossProjects()->where('project_id', 'proj-1')->count())->toBe(registeredLocalizationKeysCount())
        ->and(Localization::acrossProjects()->where('project_id', 'proj-2')->count())->toBe(registeredLocalizationKeysCount());
});

test('nightly localize:sync is scheduled', function () {
    $schedule = app(Schedule::class);

    $events = collect($schedule->events())
        ->filter(fn ($event): bool => str_contains((string) $event->command, 'localize:sync'));

    expect($events)->toHaveCount(1)
        ->and($events->first()->expression)->toBe('30 3 * * *');
});

test('reader falls back: admin value → synced default → in-memory registry', function () {
    app(ProjectContext::class)->set('proj-1');
    $reader = app(LocalizationReader::class);
    $key = ContentLocalizationKeys::NavPosts->value;

    // строки в БД нет — значение приходит из in-memory реестра
    expect($reader->get('content', $key, 'ru'))->toBe('Посты');

    $this->artisan('localize:sync', ['--project' => ['proj-1']])->assertSuccessful();

    // строка есть, переопределения нет — синхронизированный default_value
    expect($reader->get('content', $key, 'ru'))->toBe('Посты');

    $row = Localization::query()->where('key', $key)->where('locale', 'ru')->firstOrFail();
    $row->value = 'Статьи';
    $row->save();

    expect($reader->get('content', $key, 'ru'))->toBe('Статьи')
        ->and($reader->get('content', 'missing.key', 'ru'))->toBeNull();
});
