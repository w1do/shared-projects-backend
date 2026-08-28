<?php

declare(strict_types=1);

use Cms\Shared\Billing\Subscriber;

test('site user subject key keeps legacy user format byte for byte', function () {
    $subscriber = Subscriber::siteUser('7');

    expect($subscriber->subjectKey('proj-1'))->toBe('user:proj-1:7')
        ->and($subscriber->type)->toBe('site_user')
        ->and($subscriber->id)->toBe('7');
});

test('other subscriber types use their type as key namespace', function () {
    $subscriber = new Subscriber('organization', '42');

    expect($subscriber->subjectKey('proj-1'))->toBe('organization:proj-1:42');
});

test('subscriber rejects empty type or id', function (string $type, string $id) {
    new Subscriber($type, $id);
})->with([
    ['', '1'],
    ['site_user', ''],
])->throws(InvalidArgumentException::class);

test('subscriber identity compares by type and id pair', function () {
    expect(Subscriber::siteUser('7')->is(Subscriber::siteUser('7')))->toBeTrue()
        ->and(Subscriber::siteUser('7')->is(new Subscriber('organization', '7')))->toBeFalse()
        ->and(Subscriber::siteUser('7')->is(Subscriber::siteUser('8')))->toBeFalse();
});
