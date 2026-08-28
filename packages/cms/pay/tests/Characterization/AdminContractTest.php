<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Feature;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Характеризационные снимки admin-контракта pay (routes/admin.php).
 * Фиксируют текущий формат ответов до рефакторинга: конверт, ключи,
 * ТИПЫ денег (целые минорные единицы), коды и тексты ошибок, meta курсора.
 *
 * Все фикстуры заданы явными атрибутами: faker в снимках недопустим.
 */
function payAdminUrl(string $path): string
{
    return "/api/admin/v1/projects/proj-1/pay/{$path}";
}

function payAdminPlan(array $attrs = []): Plan
{
    return makePlan(array_merge([
        'code' => 'basic',
        'name' => 'Basic',
        'price_minor' => 9900,
        'currency' => 'RUB',
        'interval' => 'month',
    ], $attrs));
}

function payAdminPayment(array $attrs = []): Payment
{
    app(ProjectContext::class)->set('proj-1');

    return Payment::create(array_merge([
        'subject_key' => 'user:proj-1:7',
        'amount_minor' => 5000,
        'currency' => 'RUB',
        'status' => 'succeeded',
        'provider' => 'manual',
        'provider_ref' => 'manual-ref-1',
        'description' => 'Invoice 1',
    ], $attrs));
}

function payAdminSubscription(Plan $plan, array $attrs = []): Subscription
{
    app(ProjectContext::class)->set('proj-1');

    return Subscription::create(array_merge([
        'subscriber_type' => 'site_user',
        'subscriber_id' => '7',
        'subject_type' => 'plan',
        'subject_id' => (string) $plan->id,
        'status' => 'active',
        'current_period_ends_at' => now()->addMonth(),
    ], $attrs));
}

// ---------------------------------------------------------------- plans

test('contract: pay admin plans index', function () {
    $headers = actingAsPayOperator();

    $plan = payAdminPlan();
    $plan->options()->create(['project_id' => 'proj-1', 'key' => 'projects', 'value' => '3']);
    $feature = Feature::query()->create(['project_id' => 'proj-1', 'code' => 'api-access', 'name' => 'API access']);
    $plan->features()->attach($feature->id);

    // архивный план виден только оператору (includeArchived: true)
    payAdminPlan(['code' => 'legacy', 'name' => 'Legacy', 'price_minor' => 4900])
        ->forceFill(['archived_at' => now()])->save();

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('plans'), $headers), 'admin-plans-index');
});

test('contract: pay admin plans index empty', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('plans'), $headers), 'admin-plans-index-empty');
});

test('contract: pay admin plans index unauthenticated', function () {
    actingAsPayOperator();

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('plans')), 'admin-plans-index-401');
});

test('contract: pay admin plans index forbidden', function () {
    $headers = actingAsPayOperator(permissions: ['pay.payments.view']);

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('plans'), $headers), 'admin-plans-index-403');
});

test('contract: pay admin plans index service disabled', function () {
    $headers = actingAsPayOperator(services: []);

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('plans'), $headers), 'admin-plans-index-404-service');
});

test('contract: pay admin plans store', function () {
    $headers = actingAsPayOperator();

    $response = $this->postJson(payAdminUrl('plans'), [
        'code' => 'pro',
        'name' => 'Pro',
        'price_minor' => 19900,
        'currency' => 'RUB',
        'interval' => 'month',
        'options' => ['projects' => '10', 'storage_gb' => '50'],
        'features' => ['api-access', 'priority-support'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'admin-plans-store');
});

test('contract: pay admin plans store required fields', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches($this->postJson(payAdminUrl('plans'), [], $headers), 'admin-plans-store-422-required');
});

test('contract: pay admin plans store invalid values', function () {
    $headers = actingAsPayOperator();

    $response = $this->postJson(payAdminUrl('plans'), [
        'code' => 'not a code',
        'name' => 'Pro',
        'price_minor' => -1,
        'currency' => 'RUBLE',
        'interval' => 'week',
        'options' => 'not-an-array',
        'features' => [17],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'admin-plans-store-422-invalid');
});

test('contract: pay admin plans store forbidden', function () {
    $headers = actingAsPayOperator(permissions: ['pay.plans.view']);

    $response = $this->postJson(payAdminUrl('plans'), [
        'code' => 'pro', 'name' => 'Pro', 'price_minor' => 19900,
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'admin-plans-store-403');
});

test('contract: pay admin plans update', function () {
    $headers = actingAsPayOperator();
    $plan = payAdminPlan();

    $response = $this->putJson(payAdminUrl("plans/{$plan->id}"), [
        'code' => 'basic',
        'name' => 'Basic Plus',
        'price_minor' => 12900,
        'currency' => 'EUR',
        'interval' => 'year',
        'options' => ['projects' => '5'],
        'features' => ['api-access'],
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'admin-plans-update');
});

test('contract: pay admin plans update not found', function () {
    $headers = actingAsPayOperator();

    $response = $this->putJson(payAdminUrl('plans/999999'), [
        'code' => 'basic', 'name' => 'Basic', 'price_minor' => 9900,
    ], $headers);

    ResponseSnapshot::assertMatches($response, 'admin-plans-update-404');
});

test('contract: pay admin plans update validation error', function () {
    $headers = actingAsPayOperator();
    $plan = payAdminPlan();

    $response = $this->putJson(payAdminUrl("plans/{$plan->id}"), ['name' => 'Basic'], $headers);

    ResponseSnapshot::assertMatches($response, 'admin-plans-update-422');
});

test('contract: pay admin plan archive', function () {
    $headers = actingAsPayOperator();
    $plan = payAdminPlan();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("plans/{$plan->id}/archive"), [], $headers),
        'admin-plans-archive',
    );
});

test('contract: pay admin plan archive not found', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('plans/999999/archive'), [], $headers),
        'admin-plans-archive-404',
    );
});

// ------------------------------------------------------------- payments

test('contract: pay admin payments index empty', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('payments'), $headers), 'admin-payments-index-empty');
});

test('contract: pay admin payments index', function () {
    $headers = actingAsPayOperator();
    payAdminPayment(['status' => 'pending', 'description' => 'Invoice 1']);
    payAdminPayment([
        'amount_minor' => 19900, 'status' => 'succeeded', 'provider' => 'null',
        'description' => null, 'currency' => 'EUR',
    ]);

    ResponseSnapshot::assertMatches($this->getJson(payAdminUrl('payments'), $headers), 'admin-payments-index');
});

test('contract: pay admin payments index cursor pagination', function () {
    $headers = actingAsPayOperator();
    for ($i = 0; $i < 51; $i++) {
        payAdminPayment(['status' => 'pending', 'description' => 'Invoice']);
    }

    $first = $this->getJson(payAdminUrl('payments'), $headers);
    ResponseSnapshot::assertMatches($first, 'admin-payments-index-cursor-first');

    $cursor = $first->json('meta.next_cursor');
    ResponseSnapshot::assertMatches(
        $this->getJson(payAdminUrl('payments').'?cursor='.$cursor, $headers),
        'admin-payments-index-cursor-second',
    );
});

test('contract: pay admin payment confirm', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment(['status' => 'pending']);

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/confirm"), [], $headers),
        'admin-payment-confirm',
    );
});

test('contract: pay admin payment confirm not found', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('payments/ghost/confirm'), [], $headers),
        'admin-payment-confirm-404',
    );
});

test('contract: pay admin payment confirm invalid transition', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment(['status' => 'canceled']);

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/confirm"), [], $headers),
        'admin-payment-confirm-422',
    );
});

test('contract: pay admin payment refund full', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/refund"), [], $headers),
        'admin-payment-refund-full',
    );
});

test('contract: pay admin payment refund partial', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/refund"), ['amount_minor' => 2000], $headers),
        'admin-payment-refund-partial',
    );
});

test('contract: pay admin payment refund validation error', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/refund"), ['amount_minor' => 0], $headers),
        'admin-payment-refund-422-dto',
    );
});

test('contract: pay admin payment refund exceeds refundable', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/refund"), ['amount_minor' => 9000], $headers),
        'admin-payment-refund-422-exceeds',
    );
});

test('contract: pay admin payment refund wrong status', function () {
    $headers = actingAsPayOperator();
    $payment = payAdminPayment(['status' => 'pending']);

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/refund"), ['amount_minor' => 1000], $headers),
        'admin-payment-refund-422-status',
    );
});

test('contract: pay admin payment refund not found', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('payments/ghost/refund'), [], $headers),
        'admin-payment-refund-404',
    );
});

test('contract: pay admin payment refund forbidden', function () {
    $headers = actingAsPayOperator(permissions: ['pay.payments.view']);
    $payment = payAdminPayment();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("payments/{$payment->id}/refund"), [], $headers),
        'admin-payment-refund-403',
    );
});

// --------------------------------------------------------- subscriptions

test('contract: pay admin subscriptions index empty', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches(
        $this->getJson(payAdminUrl('subscriptions'), $headers),
        'admin-subscriptions-index-empty',
    );
});

test('contract: pay admin subscriptions index', function () {
    $headers = actingAsPayOperator();
    $plan = payAdminPlan();
    $plan->options()->create(['project_id' => 'proj-1', 'key' => 'projects', 'value' => '3']);
    payAdminSubscription($plan);

    ResponseSnapshot::assertMatches(
        $this->getJson(payAdminUrl('subscriptions'), $headers),
        'admin-subscriptions-index',
    );
});

test('contract: pay admin subscribe', function () {
    $headers = actingAsPayOperator();
    $plan = payAdminPlan();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('subscriptions'), [
            'subscriber_type' => 'site_user',
            'subscriber_id' => '7',
            'subject_type' => 'plan',
            'subject_id' => (string) $plan->id,
            'provider' => 'manual',
        ], $headers),
        'admin-subscribe',
    );
});

test('contract: pay admin subscribe unresolvable subject', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('subscriptions'), [
            'subscriber_type' => 'site_user',
            'subscriber_id' => '7',
            'subject_type' => 'plan',
            'subject_id' => '999',
        ], $headers),
        'admin-subscribe-422-subject',
    );
});

test('contract: pay admin subscribe forbidden', function () {
    $headers = actingAsPayOperator(permissions: ['pay.subscriptions.view']);

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('subscriptions'), [
            'subscriber_type' => 'site_user',
            'subscriber_id' => '7',
            'subject_type' => 'plan',
            'subject_id' => '1',
        ], $headers),
        'admin-subscribe-403',
    );
});

test('contract: pay admin subscription cancel', function () {
    $headers = actingAsPayOperator();
    $subscription = payAdminSubscription(payAdminPlan());

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/cancel"), [], $headers),
        'admin-subscription-cancel',
    );
});

test('contract: pay admin subscription pause and resume', function () {
    $headers = actingAsPayOperator();
    $subscription = payAdminSubscription(payAdminPlan());

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/pause"), [], $headers),
        'admin-subscription-pause',
    );

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/resume"), [], $headers),
        'admin-subscription-resume',
    );
});

test('contract: pay admin subscription delete', function () {
    $headers = actingAsPayOperator();
    $subscription = payAdminSubscription(payAdminPlan());

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/delete"), [], $headers),
        'admin-subscription-delete',
    );
});

test('contract: pay admin subscription change not found', function () {
    $headers = actingAsPayOperator();

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl('subscriptions/ghost/cancel'), [], $headers),
        'admin-subscription-change-404',
    );
});

test('contract: pay admin subscription change unknown action', function () {
    $headers = actingAsPayOperator();
    $subscription = payAdminSubscription(payAdminPlan());

    // whereIn на маршруте: неизвестный action — это отсутствующий маршрут, 404
    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/renew"), [], $headers),
        'admin-subscription-change-404-action',
    );
});

test('contract: pay admin subscription change invalid transition', function () {
    $headers = actingAsPayOperator();
    $subscription = payAdminSubscription(payAdminPlan());

    // active → active запрещён статус-машиной
    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/resume"), [], $headers),
        'admin-subscription-change-422',
    );
});

test('contract: pay admin subscription change forbidden', function () {
    $headers = actingAsPayOperator(permissions: ['pay.subscriptions.view']);
    $subscription = payAdminSubscription(payAdminPlan());

    ResponseSnapshot::assertMatches(
        $this->postJson(payAdminUrl("subscriptions/{$subscription->id}/cancel"), [], $headers),
        'admin-subscription-change-403',
    );
});
