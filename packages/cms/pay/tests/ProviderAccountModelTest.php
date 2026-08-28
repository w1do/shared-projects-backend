<?php

declare(strict_types=1);

use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

test('provider account casts properties to array and status to enum', function () {
    app(ProjectContext::class)->set('proj-1');

    $account = ProviderAccount::create([
        'provider' => 'platega',
        'credentials' => ['merchant_id' => 'm-1', 'secret' => 's-1'],
        'properties' => ['last_error' => null, 'note' => 'test'],
        'status' => 'archived',
    ]);

    $fresh = ProviderAccount::query()->findOrFail($account->id);

    expect($fresh->credentials)->toBe(['merchant_id' => 'm-1', 'secret' => 's-1'])
        ->and($fresh->properties)->toBe(['last_error' => null, 'note' => 'test'])
        ->and($fresh->status)->toBe(ProviderStatus::Archived)
        ->and($fresh->status->isActive())->toBeFalse()
        ->and($fresh->hasCredentials())->toBeTrue();
});

test('provider account status defaults to active and credentials stay encrypted at rest', function () {
    app(ProjectContext::class)->set('proj-1');

    $account = ProviderAccount::create([
        'provider' => 'platega',
        'credentials' => ['secret' => 'plain-secret-value'],
    ]);

    expect($account->status)->toBe(ProviderStatus::Active)
        ->and($account->status->isActive())->toBeTrue();

    $raw = (string) DB::table('provider_accounts')->where('id', $account->id)->value('credentials');

    expect($raw)->not->toContain('plain-secret-value');
});

test('provider account is unique per project and provider', function () {
    app(ProjectContext::class)->set('proj-1');

    ProviderAccount::create(['provider' => 'platega', 'credentials' => ['secret' => 'a']]);

    expect(fn () => ProviderAccount::create(['provider' => 'platega', 'credentials' => ['secret' => 'b']]))
        ->toThrow(UniqueConstraintViolationException::class);

    // Другой проект — своя запись, ограничение композитное
    app(ProjectContext::class)->set('proj-2');
    $other = ProviderAccount::create(['provider' => 'platega', 'credentials' => ['secret' => 'c']]);

    expect($other->project_id)->toBe('proj-2');
});
