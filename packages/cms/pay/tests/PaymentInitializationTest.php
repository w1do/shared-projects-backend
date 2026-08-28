<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Application\Handlers\CreatePaymentHandler;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\Http;

/** Д7: инициализация платежа по настройкам проекта + фиксация ошибок шлюза. */
function payPlategaProject(array $accountAttrs = []): void
{
    app(ProjectContext::class)->set('proj-1');
    paySelectProvider('platega');
    ProviderAccount::create(array_replace([
        'provider' => 'platega',
        'credentials' => ['merchant_id' => 'merchant-1', 'secret' => 'secret-1'],
        'return_url' => 'https://shop.example/ok',
        'fail_url' => 'https://shop.example/fail',
    ], $accountAttrs));
    makePlan(['code' => 'pro', 'price_minor' => 150050, 'currency' => 'RUB']);
    app(ProjectContext::class)->clear();
}

test('payment without explicit provider goes through the provider from settings and stores redirect_url', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response([
            'transactionId' => 'tx-1',
            'status' => 'PENDING',
            'url' => 'https://pay.platega.io/?id=tx-1',
        ]),
    ]);

    $site = actingAsSiteUser();
    payPlategaProject();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)
        ->assertCreated()
        ->assertJsonPath('data.payment.provider', 'platega')
        ->assertJsonPath('data.payment.status', 'pending')
        ->assertJsonPath('data.payment.redirect_url', 'https://pay.platega.io/?id=tx-1');

    $payment = Payment::acrossProjects()->firstOrFail();

    expect($payment->provider)->toBe('platega')
        ->and($payment->provider_ref)->toBe('tx-1')
        ->and($payment->redirect_url)->toBe('https://pay.platega.io/?id=tx-1');
});

test('gateway error marks the payment failed and records last_error in provider settings', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response(['code' => 'LIMIT_EXCEEDED'], 502),
    ]);

    $site = actingAsSiteUser();
    payPlategaProject();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)
        ->assertCreated()
        ->assertJsonPath('data.payment.status', 'failed')
        ->assertJsonPath('data.payment.redirect_url', null);

    $payment = Payment::acrossProjects()->firstOrFail();

    expect($payment->status)->toBe(PaymentStatus::Failed)
        ->and($payment->provider_ref)->toBeNull();

    $account = ProviderAccount::acrossProjects()
        ->where('project_id', 'proj-1')->where('provider', 'platega')->firstOrFail();
    $lastError = $account->properties['last_error'] ?? null;

    expect($lastError)->not->toBeNull()
        ->and($lastError['code'])->toBe('LIMIT_EXCEEDED')
        ->and($lastError['payment_id'])->toBe($payment->id)
        ->and($lastError['message'])->toContain('502')
        ->and($lastError['occurred_at'])->not->toBeNull();
});

test('unconfigured provider is a domain error and no external transaction is attempted', function () {
    Http::fake();

    $site = actingAsSiteUser();
    app(ProjectContext::class)->set('proj-1');
    paySelectProvider('platega'); // выбран в настройках, но записи credentials нет
    makePlan(['code' => 'pro', 'price_minor' => 1000]);
    app(ProjectContext::class)->clear();

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'validation_failed');

    Http::assertNothingSent();

    // Локальный платёж закрыт failed — «висящих» created не остаётся
    expect(Payment::acrossProjects()->firstOrFail()->status)->toBe(PaymentStatus::Failed);
});

test('archived provider rejects initiation and no payment row appears', function () {
    Http::fake();

    $site = actingAsSiteUser();
    payPlategaProject(['status' => 'archived']);

    $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'pro'], $site)
        ->assertUnprocessable();

    Http::assertNothingSent();

    expect(Payment::acrossProjects()->count())->toBe(0);
});

test('explicit provider in the payment DTO overrides the settings default', function () {
    // Настройки говорят platega, но внутренний вызов с provider=manual уважается
    $site = actingAsSiteUser();
    payPlategaProject();

    app(ProjectContext::class)->set('proj-1');
    $payment = app(CreatePaymentHandler::class)->handle(
        new CreatePaymentCommand(
            userKey: 'user:proj-1:7',
            data: CreatePaymentDTO::from([
                'amount_minor' => 500, 'currency' => 'RUB', 'provider' => 'manual',
            ]),
        ),
    );

    expect($payment->provider)->toBe('manual')
        ->and($payment->status)->toBe(PaymentStatus::Pending);
});
