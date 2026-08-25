<?php

declare(strict_types=1);

use Cms\Shared\Values\Currency;
use Cms\Shared\Values\Locale;
use Cms\Shared\Values\Money;
use Cms\Shared\Values\ProjectId;

test('money serializes as integer minor units plus currency', function () {
    $money = Money::of(19900, 'RUB');

    expect(json_decode(json_encode($money), true))->toBe([
        'amount_minor' => 19900,
        'currency' => 'RUB',
    ]);
});

test('money arithmetic stays in integers', function () {
    $a = Money::of(100, 'USD');
    $b = Money::of(250, 'USD');

    expect($a->add($b)->amountMinor)->toBe(350)
        ->and($a->subtract($b)->amountMinor)->toBe(-150)
        ->and($a->subtract($b)->isNegative())->toBeTrue();
});

test('money rejects mixing currencies', function () {
    Money::of(100, 'USD')->add(Money::of(100, 'EUR'));
})->throws(InvalidArgumentException::class);

test('currency validates iso alpha-3', function () {
    new Currency('rub');
})->throws(InvalidArgumentException::class);

test('locale validates format', function () {
    expect((string) new Locale('ru'))->toBe('ru')
        ->and((string) new Locale('en-US'))->toBe('en-US');
    new Locale('russian');
})->throws(InvalidArgumentException::class);

test('project id must not be empty', function () {
    new ProjectId('');
})->throws(InvalidArgumentException::class);
