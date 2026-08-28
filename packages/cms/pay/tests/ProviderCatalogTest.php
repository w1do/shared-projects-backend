<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Domain\ValueObjects\GatewayConfig;
use Cms\Pay\Infrastructure\Gateways\ProviderCatalog;
use Cms\Shared\Tenant\ProjectContext;

test('catalog returns metadata defaults for known provider', function () {
    expect(ProviderCatalog::metadataFor('platega'))->toBe([
        'group' => 'payments',
        'label' => 'Платёжные системы',
        'name' => 'Platega',
    ]);
});

test('catalog falls back to generic defaults for unknown provider', function () {
    expect(ProviderCatalog::metadataFor('manual'))->toBe([
        'group' => 'payments',
        'label' => null,
        'name' => 'manual',
    ]);
});

test('gateway config builds from provider account', function () {
    app(ProjectContext::class)->set('proj-1');

    $account = ProviderAccount::create([
        'provider' => 'platega',
        'credentials' => ['merchant_id' => 'm-1', 'secret' => 's-1'],
        'properties' => ['note' => 'x'],
        'return_url' => 'https://shop.example/ok',
        'fail_url' => 'https://shop.example/fail',
    ]);

    $config = GatewayConfig::fromAccount($account);

    expect($config->credentials)->toBe(['merchant_id' => 'm-1', 'secret' => 's-1'])
        ->and($config->returnUrl)->toBe('https://shop.example/ok')
        ->and($config->failUrl)->toBe('https://shop.example/fail')
        ->and($config->properties)->toBe(['note' => 'x'])
        ->and($config->hasCredentials())->toBeTrue()
        ->and($config->credential('merchant_id'))->toBe('m-1')
        ->and($config->credential('missing'))->toBeNull();
});

test('empty gateway config has no credentials and null urls', function () {
    $config = GatewayConfig::empty();

    expect($config->credentials)->toBe([])
        ->and($config->properties)->toBe([])
        ->and($config->returnUrl)->toBeNull()
        ->and($config->failUrl)->toBeNull()
        ->and($config->hasCredentials())->toBeFalse();
});
