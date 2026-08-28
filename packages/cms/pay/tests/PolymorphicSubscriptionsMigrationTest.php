<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Накат и откат 0003_01_02_000000_polymorphic_subscriptions на sqlite:
 * откат возвращает старую схему (user_key/plan_id), повторный накат
 * бэкфиллит полиморфные пары из легаси-строк.
 */

/** Откатывает миграции по одной, пока не вернётся легаси-схема подписок. */
function rollbackToLegacySubscriptions(): void
{
    for ($i = 0; $i < 10 && ! Schema::hasColumn('subscriptions', 'user_key'); $i++) {
        Artisan::call('migrate:rollback', ['--step' => 1]);
    }
}

test('polymorphic migration backfills legacy subscription rows on re-run', function () {
    rollbackToLegacySubscriptions();

    expect(Schema::hasColumns('subscriptions', ['user_key', 'plan_id']))->toBeTrue()
        ->and(Schema::hasColumn('subscriptions', 'subscriber_type'))->toBeFalse()
        ->and(Schema::hasColumn('payments', 'user_key'))->toBeTrue();

    $planId = DB::table('plans')->insertGetId([
        'project_id' => 'proj-1', 'code' => 'basic', 'name' => 'Basic',
        'price_minor' => 19900, 'currency' => 'RUB', 'interval' => 'month',
        'created_at' => now(), 'updated_at' => now(),
    ]);

    $subscriptionId = (string) Str::ulid();
    DB::table('subscriptions')->insert([
        'id' => $subscriptionId, 'project_id' => 'proj-1',
        'user_key' => 'user:proj-1:7', 'plan_id' => $planId,
        'status' => 'active', 'current_period_ends_at' => now()->addMonth(),
        'renewal_attempts' => 0, 'created_at' => now(), 'updated_at' => now(),
    ]);

    $paymentId = (string) Str::ulid();
    DB::table('payments')->insert([
        'id' => $paymentId, 'project_id' => 'proj-1', 'user_key' => 'user:proj-1:7',
        'amount_minor' => 19900, 'currency' => 'RUB', 'status' => 'succeeded',
        'provider' => 'manual', 'subscription_id' => $subscriptionId,
        'created_at' => now(), 'updated_at' => now(),
    ]);

    Artisan::call('migrate');

    $this->assertDatabaseHas('subscriptions', [
        'id' => $subscriptionId,
        'subscriber_type' => 'site_user',
        'subscriber_id' => '7',
        'subject_type' => 'plan',
        'subject_id' => (string) $planId,
    ]);
    $this->assertDatabaseHas('payments', [
        'id' => $paymentId,
        'subject_key' => 'user:proj-1:7',
    ]);
    expect(Schema::hasColumn('subscriptions', 'user_key'))->toBeFalse()
        ->and(Schema::hasColumn('subscriptions', 'plan_id'))->toBeFalse();
});

test('rolling back restores legacy columns from polymorphic pairs', function () {
    $planId = DB::table('plans')->insertGetId([
        'project_id' => 'proj-1', 'code' => 'basic', 'name' => 'Basic',
        'price_minor' => 19900, 'currency' => 'RUB', 'interval' => 'month',
        'created_at' => now(), 'updated_at' => now(),
    ]);

    $subscriptionId = (string) Str::ulid();
    DB::table('subscriptions')->insert([
        'id' => $subscriptionId, 'project_id' => 'proj-1',
        'subscriber_type' => 'site_user', 'subscriber_id' => '7',
        'subject_type' => 'plan', 'subject_id' => (string) $planId,
        'status' => 'active', 'current_period_ends_at' => now()->addMonth(),
        'renewal_attempts' => 0, 'created_at' => now(), 'updated_at' => now(),
    ]);

    rollbackToLegacySubscriptions();

    $this->assertDatabaseHas('subscriptions', [
        'id' => $subscriptionId,
        'user_key' => 'user:proj-1:7',
        'plan_id' => $planId,
    ]);

    Artisan::call('migrate');
});
