<?php

declare(strict_types=1);

use Cms\Contracts\Manifest\PermissionDefinition;
use Cms\Contracts\Manifest\ServiceManifest;
use Cms\Pay\PayManifest;

test('pay manifest declares licensing permissions in the licensing group', function () {
    $permissions = collect(PayManifest::build()->permissions)
        ->keyBy(fn (PermissionDefinition $p) => $p->key);

    expect($permissions)->toHaveKeys(['pay.licensing.view', 'pay.licensing.manage'])
        ->and($permissions['pay.licensing.view']->group)->toBe('licensing')
        ->and($permissions['pay.licensing.manage']->group)->toBe('licensing');

    // round-trip манифеста: права доезжают до auth-service в toArray-форме
    $restored = collect(ServiceManifest::fromArray(PayManifest::build()->toArray())->permissions)
        ->map(fn (PermissionDefinition $p) => $p->key);
    expect($restored)->toContain('pay.licensing.view', 'pay.licensing.manage');
});

test('licensing permission gates the routes: role with the permission passes, without gets 403', function () {
    // Роль оператора выражается набором прав в introspection — так их отдаёт
    // auth-service после сида манифеста; AuthorizeOperator проверяет can()
    $viewer = actingAsPayOperator(permissions: ['pay.licensing.view']);
    $this->getJson('/api/admin/v1/projects/proj-1/pay/licensing/organizations', $viewer)->assertOk();
    $this->postJson('/api/admin/v1/projects/proj-1/pay/licensing/organizations', [
        'name' => 'Acme', 'contact_first_name' => 'I', 'contact_last_name' => 'P', 'email' => 'a@b.c',
    ], $viewer)->assertForbidden();

    $manager = actingAsPayOperator(permissions: ['pay.licensing.view', 'pay.licensing.manage']);
    $this->postJson('/api/admin/v1/projects/proj-1/pay/licensing/organizations', [
        'name' => 'Acme', 'contact_first_name' => 'I', 'contact_last_name' => 'P', 'email' => 'a@b.c',
    ], $manager)->assertCreated();

    $none = actingAsPayOperator(permissions: ['pay.plans.view']);
    $this->getJson('/api/admin/v1/projects/proj-1/pay/licensing/organizations', $none)->assertForbidden();
});
