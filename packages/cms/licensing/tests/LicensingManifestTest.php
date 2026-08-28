<?php

declare(strict_types=1);

use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Licensing\LicensingManifest;
use Illuminate\Support\Facades\Http;

test('licensing manifest declares its own key and navigation, permissions stay in pay manifest', function () {
    $manifest = LicensingManifest::build();

    expect($manifest->key)->toBe('licensing')
        ->and($manifest->permissions)->toBeEmpty()
        ->and($manifest->settings)->toBeEmpty()
        ->and(collect($manifest->navigation)->pluck('permission'))->toContain('pay.licensing.view');

    // round-trip: навигация доезжает до auth-service в toArray-форме
    $restored = ServiceManifest::fromArray($manifest->toArray());
    expect(collect($restored->navigation)->pluck('key'))->toContain('licensing');
});

test('manifest:publish-licensing command publishes the licensing manifest', function () {
    Http::fake(['*' => Http::response(['data' => ['key' => 'licensing']], 200)]);

    $this->artisan('manifest:publish-licensing')->assertSuccessful();

    Http::assertSent(function ($request) {
        return str_contains($request->url(), 'manifest') && $request['key'] === 'licensing';
    });
});
