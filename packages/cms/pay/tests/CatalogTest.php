<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;

test('plan crud with options and features', function () {
    $headers = actingAsPayOperator();

    $created = $this->postJson('/api/admin/v1/projects/proj-1/pay/plans', [
        'code' => 'pro', 'name' => 'Pro', 'price_minor' => 19900,
        'options' => ['projects' => '10', 'storage_gb' => '50'],
        'features' => ['api-access', 'priority-support'],
    ], $headers)->assertCreated();

    expect($created->json('data.price_minor'))->toBe(19900)
        ->and($created->json('data.options.projects'))->toBe('10')
        ->and($created->json('data.features'))->toContain('api-access');

    $planId = $created->json('data.id');
    $this->putJson("/api/admin/v1/projects/proj-1/pay/plans/{$planId}", [
        'code' => 'pro', 'name' => 'Pro+', 'price_minor' => 24900, 'features' => ['api-access'],
    ], $headers)->assertOk()->assertJsonPath('data.name', 'Pro+')->assertJsonCount(1, 'data.features');
});

test('public catalog returns only active plans', function () {
    $headers = actingAsPayOperator();
    makePlan(['code' => 'live', 'price_minor' => 100]);
    $archived = makePlan(['code' => 'old', 'price_minor' => 50]);
    $archived->forceFill(['archived_at' => now()])->save();

    $site = actingAsSiteUser();
    $list = $this->getJson('/api/v1/pay/plans', $site)->assertOk()->json('data');

    expect(collect($list)->pluck('code'))->toContain('live')->not->toContain('old');
});

test('plan with subscriptions is archived instead of deleted', function () {
    $headers = actingAsPayOperator();
    $plan = makePlan(['code' => 'busy']);
    Subscription::create(['project_id' => 'proj-1', 'user_key' => 'user:proj-1:1', 'plan_id' => $plan->id,
        'current_period_ends_at' => now()->addMonth()]);

    $this->postJson("/api/admin/v1/projects/proj-1/pay/plans/{$plan->id}/archive", [], $headers)
        ->assertOk()->assertJsonPath('data.archived', true);

    expect(Plan::acrossProjects()->whereKey($plan->id)->exists())->toBeTrue()
        ->and(Subscription::acrossProjects()->where('plan_id', $plan->id)->exists())->toBeTrue();
});

test('money is integers everywhere in responses', function () {
    actingAsPayOperator();
    makePlan(['price_minor' => 19999]);

    $site = actingAsSiteUser();
    $plan = $this->getJson('/api/v1/pay/plans', $site)->json('data.0');

    expect($plan['price_minor'])->toBeInt();
});
