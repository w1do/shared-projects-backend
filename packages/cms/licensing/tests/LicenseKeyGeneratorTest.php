<?php

declare(strict_types=1);

use Cms\Licensing\Domain\Contracts\LicenseKeyGenerator;
use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;
use Cms\Shared\Tenant\ProjectContext;

// -------------------------------------------------------- 1.3 формат ключа

test('generated key matches LIC-XXXX-XXXX-XXXX-XXXX with the restricted alphabet', function () {
    $generator = app(LicenseKeyGenerator::class);

    for ($i = 0; $i < 20; $i++) {
        $key = $generator->generate();

        // алфавит без 0 O 1 I (ТЗ 1.4) — маркер LIC- не в счёт
        expect($key)->toMatch('/^LIC(-[A-HJ-NP-Z2-9]{4}){4}$/')
            ->and(substr($key, 4))->not->toMatch('/[0O1I]/');
    }
});

test('generated keys are unique across calls and against stored hashes', function () {
    app(ProjectContext::class)->set('proj-1');
    $generator = app(LicenseKeyGenerator::class);

    $existing = $generator->generate();
    License::factory()->withKey($existing)->create();

    $keys = collect(range(1, 30))->map(fn () => $generator->generate());

    expect($keys->unique()->count())->toBe(30)
        ->and($keys->contains($existing))->toBeFalse();
});

// ---------------------------------------------- 1.3 нормализация и хэширование

test('license key hash is sha256 of the normalized form', function () {
    $key = LicenseKey::fromInput('  lic-abcd-efgh-jklm-npqr ');

    expect($key->normalized)->toBe('LIC-ABCD-EFGH-JKLM-NPQR')
        ->and($key->hash())->toBe(hash('sha256', 'LIC-ABCD-EFGH-JKLM-NPQR'))
        ->and($key->prefix())->toBe('LIC-ABCD');
});

test('license is resolvable by key in any input casing', function () {
    app(ProjectContext::class)->set('proj-1');
    $license = License::factory()->withKey('LIC-ABCD-EFGH-JKLM-NPQR')->create();
    app(ProjectContext::class)->clear();

    expect(License::findByKey('lic-abcd-efgh-jklm-npqr ')?->id)->toBe($license->id)
        ->and(License::findByKey('LIC-XXXX-XXXX-XXXX-XXXX'))->toBeNull();
});
