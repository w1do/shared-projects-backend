<?php

declare(strict_types=1);

use Cms\Auth\Domain\Models\Admin;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    config()->set('cms-auth.operator.email', 'root@example.com');
    config()->set('cms-auth.operator.password', 'secret-123');
});

test('operator:seed creates the root operator with super-admin', function () {
    $this->artisan('operator:seed')->assertSuccessful();

    $admin = Admin::query()->where('email', 'root@example.com')->firstOrFail();

    expect($admin->isSuperAdmin())->toBeTrue()
        ->and(Hash::check('secret-123', $admin->password))->toBeTrue();
});

test('operator:seed is idempotent and never overwrites an existing operator', function () {
    $this->artisan('operator:seed')->assertSuccessful();

    $admin = Admin::query()->where('email', 'root@example.com')->firstOrFail();
    $admin->update(['password' => 'changed-by-operator']);

    $this->artisan('operator:seed')->assertSuccessful();

    expect(Admin::query()->where('email', 'root@example.com')->count())->toBe(1);

    $admin->refresh();
    expect(Hash::check('changed-by-operator', $admin->password))->toBeTrue()
        ->and($admin->isSuperAdmin())->toBeTrue();
});

test('operator:seed refuses the public dev password in production', function () {
    app()->detectEnvironment(fn () => 'production');

    $this->artisan('operator:seed')->assertSuccessful();

    expect(Admin::query()->count())->toBe(0);
});

test('operator:seed skips when credentials are not configured', function () {
    config()->set('cms-auth.operator.email', null);

    $this->artisan('operator:seed')->assertSuccessful();

    expect(Admin::query()->count())->toBe(0);
});
