<?php

declare(strict_types=1);

use Cms\Contracts\Events\AnalyticsEvent;
use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Contracts\Manifest\NavigationItem;
use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Contracts\Manifest\SettingDefinition;

test('service manifest round-trips through array form', function () {
    $manifest = new ServiceManifest(
        key: 'content',
        version: '1.2.0',
        permissions: [new PermissionDefinition('content.posts.view', 'Просмотр постов', 'posts')],
        navigation: [new NavigationItem('content.posts', 'nav.posts', '/content/posts', 'content.posts.view', 'file', 10, [
            new NavigationItem('content.posts.drafts', 'nav.drafts', '/content/posts/drafts'),
        ])],
        settings: [new SettingDefinition('content.cache_ttl', 'integer', 'TTL кэша', 300, ['integer', 'min:0'])],
    );

    $restored = ServiceManifest::fromArray($manifest->toArray());

    expect($restored->toArray())->toBe($manifest->toArray())
        ->and($restored->navigation[0]->children[0]->key)->toBe('content.posts.drafts')
        ->and($restored->settings[0]->secret)->toBeFalse();
});

test('introspection result round-trips and checks permissions', function () {
    $result = new IntrospectionResult(
        subject: Subject::Admin,
        active: true,
        projectId: 'proj-1',
        userId: '42',
        permissions: ['content.posts.view'],
        enabledServices: ['content', 'analytics'],
    );

    $restored = IntrospectionResult::fromArray($result->toArray());

    expect($restored->can('content.posts.view'))->toBeTrue()
        ->and($restored->can('pay.plans.manage'))->toBeFalse()
        ->and($restored->serviceEnabled('content'))->toBeTrue()
        ->and($restored->serviceEnabled('pay'))->toBeFalse();
});

test('super admin passes every permission check', function () {
    $result = new IntrospectionResult(subject: Subject::Admin, active: true, superAdmin: true);

    expect($result->can('anything.at.all'))->toBeTrue();
});

test('invalid introspection is inactive', function () {
    expect(IntrospectionResult::invalid()->active)->toBeFalse();
});

test('analytics event round-trips with minor units', function () {
    $event = new AnalyticsEvent(
        eventId: '018f6f2a-0000-7000-8000-000000000001',
        projectId: 'proj-1',
        name: 'payment.succeeded',
        subjectKey: 'user:proj-1:42',
        occurredAt: '2026-08-24T10:00:00Z',
        props: ['plan' => 'pro'],
        valueMinor: 19900,
        currency: 'RUB',
    );

    $restored = AnalyticsEvent::fromArray($event->toArray());

    expect($restored->valueMinor)->toBe(19900)
        ->and($restored->toArray())->toBe($event->toArray());
});
