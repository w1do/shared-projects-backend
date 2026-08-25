<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Feature;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Arr;

/**
 * Характеризационные снимки публичного контракта pay (routes/public.php).
 * Особо важны: деньги целыми минорными единицами, 404 (а не 403) на чужую
 * подписку, 422 из DTO и из handler'ов, 401 без токена пользователя сайта.
 *
 * Все фикстуры заданы явными атрибутами: faker в снимках недопустим.
 */
function payPublicPlan(array $attrs = []): Plan
{
    return makePlan(array_merge([
        'code' => 'pro',
        'name' => 'Pro',
        'price_minor' => 19900,
        'currency' => 'RUB',
        'interval' => 'month',
    ], $attrs));
}

function payPublicSubscription(Plan $plan, string $userKey = 'user:proj-1:7'): Subscription
{
    app(ProjectContext::class)->set('proj-1');

    return Subscription::create([
        'user_key' => $userKey,
        'plan_id' => $plan->id,
        'status' => 'active',
        'current_period_ends_at' => now()->addMonth(),
    ]);
}

// ---------------------------------------------------------------- plans

test('contract: pay public plans', function () {
    $plan = payPublicPlan();
    $plan->options()->create(['project_id' => 'proj-1', 'key' => 'projects', 'value' => '10']);
    $feature = Feature::query()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);
    $plan->features()->attach($feature->id);

    // архивный план в публичный каталог не попадает
    payPublicPlan(['code' => 'legacy', 'name' => 'Legacy', 'price_minor' => 4900])
        ->forceFill(['archived_at' => now()])->save();

    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches($this->getJson('/api/v1/pay/plans', $site), 'public-plans');
});

test('contract: pay public plans empty', function () {
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches($this->getJson('/api/v1/pay/plans', $site), 'public-plans-empty');
});

test('contract: pay public plans without api key', function () {
    actingAsSiteUser();

    ResponseSnapshot::assertMatches($this->getJson('/api/v1/pay/plans'), 'public-plans-401');
});

test('contract: pay public plans service disabled', function () {
    $site = actingAsSiteUser(services: []);

    ResponseSnapshot::assertMatches($this->getJson('/api/v1/pay/plans', $site), 'public-plans-404-service');
});

// --------------------------------------------------------- subscribe

test('contract: pay public subscribe', function () {
    payPublicPlan();
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site),
        'public-subscribe',
    );
});

test('contract: pay public subscribe validation error', function () {
    payPublicPlan();
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', [], $site),
        'public-subscribe-422-required',
    );
});

test('contract: pay public subscribe unknown plan', function () {
    payPublicPlan();
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'ghost'], $site),
        'public-subscribe-422-unknown-plan',
    );
});

test('contract: pay public subscribe archived plan', function () {
    payPublicPlan()->forceFill(['archived_at' => now()])->save();
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site),
        'public-subscribe-422-archived-plan',
    );
});

test('contract: pay public subscribe duplicate', function () {
    $plan = payPublicPlan();
    payPublicSubscription($plan);
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site),
        'public-subscribe-422-duplicate',
    );
});

test('contract: pay public subscribe without user token', function () {
    payPublicPlan();
    $site = Arr::except(actingAsSiteUser(), 'X-User-Token');

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site),
        'public-subscribe-401',
    );
});

test('contract: pay public subscribe idempotency key too long', function () {
    payPublicPlan();
    $site = actingAsSiteUser() + ['Idempotency-Key' => str_repeat('k', 129)];

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site),
        'public-subscribe-422-idempotency-key',
    );
});

test('contract: pay public subscribe idempotent replay', function () {
    payPublicPlan();
    $site = actingAsSiteUser() + ['Idempotency-Key' => 'sub-key-1'];

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)->assertCreated();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site),
        'public-subscribe-idempotent-replay',
    );
});

// ------------------------------------------------- subscription change

test('contract: pay public subscription cancel', function () {
    $subscription = payPublicSubscription(payPublicPlan());
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/cancel", [], $site),
        'public-subscription-cancel',
    );
});

test('contract: pay public subscription pause and resume', function () {
    $subscription = payPublicSubscription(payPublicPlan());
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/pause", [], $site),
        'public-subscription-pause',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/resume", [], $site),
        'public-subscription-resume',
    );
});

test('contract: pay public subscription unknown action', function () {
    $subscription = payPublicSubscription(payPublicPlan());
    $site = actingAsSiteUser();

    // delete доступен только оператору: публично это 422, а не 404
    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/delete", [], $site),
        'public-subscription-422-action',
    );
});

test('contract: pay public subscription invalid transition', function () {
    $subscription = payPublicSubscription(payPublicPlan());
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/resume", [], $site),
        'public-subscription-422-transition',
    );
});

test('contract: pay public subscription not found', function () {
    payPublicSubscription(payPublicPlan());
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->postJson('/api/v1/pay/subscriptions/ghost/cancel', [], $site),
        'public-subscription-404',
    );
});

test('contract: pay public subscription of another user', function () {
    $subscription = payPublicSubscription(payPublicPlan());

    // владение зашито в where user_key: чужая подписка — 404, не 403
    $other = actingAsSiteUser(userId: '8');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/cancel", [], $other),
        'public-subscription-404-foreign',
    );
});

test('contract: pay public subscription change without user token', function () {
    $subscription = payPublicSubscription(payPublicPlan());
    $site = Arr::except(actingAsSiteUser(), 'X-User-Token');

    ResponseSnapshot::assertMatches(
        $this->postJson("/api/v1/pay/subscriptions/{$subscription->id}/cancel", [], $site),
        'public-subscription-change-401',
    );
});

// --------------------------------------------------------------- mine

test('contract: pay public subscriptions mine', function () {
    $plan = payPublicPlan();
    $plan->options()->create(['project_id' => 'proj-1', 'key' => 'projects', 'value' => '10']);
    payPublicSubscription($plan);
    payPublicSubscription(payPublicPlan(['code' => 'lite', 'name' => 'Lite', 'price_minor' => 4900]));

    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches($this->getJson('/api/v1/pay/subscriptions', $site), 'public-subscriptions-mine');
});

test('contract: pay public subscriptions mine empty', function () {
    payPublicSubscription(payPublicPlan(), 'user:proj-1:99');
    $site = actingAsSiteUser();

    ResponseSnapshot::assertMatches(
        $this->getJson('/api/v1/pay/subscriptions', $site),
        'public-subscriptions-mine-empty',
    );
});

test('contract: pay public subscriptions mine without user token', function () {
    $site = Arr::except(actingAsSiteUser(), 'X-User-Token');

    ResponseSnapshot::assertMatches($this->getJson('/api/v1/pay/subscriptions', $site), 'public-subscriptions-mine-401');
});
