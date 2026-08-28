<?php

declare(strict_types=1);

use Cms\Pay\Application\Exceptions\ProviderNotConfigured;
use Cms\Pay\Application\Exceptions\ProviderRequestFailed;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\ValueObjects\GatewayConfig;
use Cms\Pay\Infrastructure\Gateways\PlategaProvider;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Values\Money;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

function plategaConfig(array $overrides = []): GatewayConfig
{
    return new GatewayConfig(...array_replace([
        'credentials' => ['merchant_id' => 'merchant-1', 'secret' => 'secret-1'],
        'returnUrl' => 'https://shop.example/ok',
        'failUrl' => 'https://shop.example/fail',
    ], $overrides));
}

function plategaPayment(array $attrs = []): Payment
{
    app(ProjectContext::class)->set('proj-1');

    return Payment::create(array_replace([
        'user_key' => 'user:proj-1:7',
        'amount_minor' => 150050,
        'currency' => 'RUB',
        'provider' => 'platega',
        'description' => 'Subscription pro',
    ], $attrs));
}

test('platega createPayment sends decimal amount with merchant headers and maps the response', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response([
            'transactionId' => '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            'status' => 'PENDING',
            'url' => 'https://pay.platega.io/?id=example',
            'expiresIn' => '00:15:00',
        ]),
    ]);

    $payment = plategaPayment();
    $result = (new PlategaProvider)->configure(plategaConfig())->createPayment($payment);

    expect($result)->toBe([
        'external_id' => '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        'redirect_url' => 'https://pay.platega.io/?id=example',
        'status' => 'pending',
    ]);

    Http::assertSent(function (ClientRequest $request) use ($payment): bool {
        $data = $request->data();

        return $request->hasHeader('X-MerchantId', 'merchant-1')
            && $request->hasHeader('X-Secret', 'secret-1')
            && ! array_key_exists('id', $data) // ID транзакции генерирует Platega
            && $data['paymentDetails'] === ['amount' => 1500.5, 'currency' => 'RUB']
            && $data['return'] === 'https://shop.example/ok'
            && $data['failedUrl'] === 'https://shop.example/fail'
            && $data['payload'] === $payment->id
            && $data['metadata'] === ['userId' => 'user:proj-1:7'];
    });
});

test('platega createPayment falls back to redirect field of the preset-method endpoint', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response([
            'transactionId' => 'tx-1',
            'status' => 'PENDING',
            'redirect' => 'https://pay.platega.io/alt',
        ]),
    ]);

    $result = (new PlategaProvider)->configure(plategaConfig())->createPayment(plategaPayment());

    expect($result['redirect_url'])->toBe('https://pay.platega.io/alt');
});

test('platega createPayment without credentials fails before any external call', function () {
    Http::fake();

    $provider = (new PlategaProvider)->configure(GatewayConfig::empty());

    expect(fn () => $provider->createPayment(plategaPayment()))
        ->toThrow(ProviderNotConfigured::class);

    Http::assertNothingSent();
});

test('platega createPayment wraps an API error with its status and code', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response(['code' => 'INVALID_MERCHANT'], 401),
    ]);

    try {
        (new PlategaProvider)->configure(plategaConfig())->createPayment(plategaPayment());
        $this->fail('ProviderRequestFailed expected');
    } catch (ProviderRequestFailed $exception) {
        expect($exception->status)->toBe(401)
            ->and($exception->errorCode)->toBe('INVALID_MERCHANT');
    }
});

test('platega createPayment treats a response without transactionId as malformed', function () {
    Http::fake([
        'https://app.platega.io/v2/transaction/process' => Http::response(['status' => 'PENDING']),
    ]);

    $provider = (new PlategaProvider)->configure(plategaConfig());

    expect(fn () => $provider->createPayment(plategaPayment()))
        ->toThrow(ProviderRequestFailed::class);
});

test('platega maps callback statuses onto the payment status machine', function () {
    expect(PlategaProvider::mapStatus('PENDING'))->toBe(PaymentStatus::Pending)
        ->and(PlategaProvider::mapStatus('CONFIRMED'))->toBe(PaymentStatus::Succeeded)
        ->and(PlategaProvider::mapStatus('CANCELED'))->toBe(PaymentStatus::Canceled)
        ->and(PlategaProvider::mapStatus('CHARGEBACKED'))->toBe(PaymentStatus::RefundedFull)
        ->and(PlategaProvider::mapStatus('SOMETHING_NEW'))->toBeNull();
});

test('platega parseWebhook maps known statuses and keeps unknown ones raw', function () {
    $provider = new PlategaProvider;

    expect($provider->parseWebhook(['id' => 'tx-1', 'status' => 'CONFIRMED']))->toBe([
        'external_id' => 'tx-1',
        'status' => 'succeeded',
        'payment_id' => null,
    ])->and($provider->parseWebhook(['id' => 'tx-1', 'status' => 'NEW_STATUS', 'payload' => 'pay-9']))->toBe([
        'external_id' => 'tx-1',
        'status' => 'NEW_STATUS',
        'payment_id' => 'pay-9',
    ]);
});

test('platega refund checks cancel-supported before cancelling', function () {
    Http::fake([
        'https://app.platega.io/transaction/tx-9/cancel-supported' => Http::response(['supported' => true]),
        'https://app.platega.io/transaction/tx-9/cancel' => Http::response([
            'transactionId' => 'tx-9', 'accepted' => true,
        ]),
    ]);

    $payment = plategaPayment(['provider_ref' => 'tx-9']);
    $result = (new PlategaProvider)->configure(plategaConfig())->refund($payment, Money::of(150050, 'RUB'));

    expect($result)->toBe(['external_id' => 'tx-9', 'status' => 'refunded']);

    Http::assertSentInOrder([
        fn (ClientRequest $request): bool => str_ends_with($request->url(), '/transaction/tx-9/cancel-supported'),
        fn (ClientRequest $request): bool => str_ends_with($request->url(), '/transaction/tx-9/cancel'),
    ]);
});

test('platega refund refuses when cancel is not supported', function () {
    Http::fake([
        'https://app.platega.io/transaction/tx-9/cancel-supported' => Http::response([
            'supported' => false, 'blockReason' => 'INSUFFICIENT_BALANCE',
        ]),
    ]);

    $payment = plategaPayment(['provider_ref' => 'tx-9']);
    $provider = (new PlategaProvider)->configure(plategaConfig());

    try {
        $provider->refund($payment, Money::of(100, 'RUB'));
        $this->fail('ProviderRequestFailed expected');
    } catch (ProviderRequestFailed $exception) {
        expect($exception->errorCode)->toBe('INSUFFICIENT_BALANCE');
    }

    Http::assertNotSent(fn (ClientRequest $request): bool => str_ends_with($request->url(), '/cancel'));
});

test('platega verifyWebhook checks only the payload form at intake', function () {
    $provider = new PlategaProvider;

    $valid = Request::create('/webhooks/platega', 'POST', ['id' => 'tx-1', 'status' => 'CONFIRMED']);
    $missingStatus = Request::create('/webhooks/platega', 'POST', ['id' => 'tx-1']);
    $missingId = Request::create('/webhooks/platega', 'POST', ['status' => 'CONFIRMED']);

    expect($provider->verifyWebhook($valid))->toBeTrue()
        ->and($provider->verifyWebhook($missingStatus))->toBeFalse()
        ->and($provider->verifyWebhook($missingId))->toBeFalse();
});

test('platega callback auth snapshot keeps only the secret hash and verifies against project credentials', function () {
    $request = Request::create('/webhooks/platega', 'POST', ['id' => 'tx-1', 'status' => 'CONFIRMED']);
    $request->headers->set('X-MerchantId', 'merchant-1');
    $request->headers->set('X-Secret', 'secret-1');

    $snapshot = (new PlategaProvider)->webhookAuthSnapshot($request);

    expect($snapshot)->toBe([
        'merchant_id' => 'merchant-1',
        'secret_hash' => hash('sha256', 'secret-1'),
    ]);

    $provider = (new PlategaProvider)->configure(plategaConfig());

    expect($provider->verifyWebhookAuth($snapshot))->toBeTrue()
        ->and($provider->verifyWebhookAuth(['merchant_id' => 'merchant-1', 'secret_hash' => hash('sha256', 'wrong')]))->toBeFalse()
        ->and($provider->verifyWebhookAuth(['merchant_id' => 'wrong', 'secret_hash' => hash('sha256', 'secret-1')]))->toBeFalse()
        ->and($provider->verifyWebhookAuth(null))->toBeFalse()
        ->and((new PlategaProvider)->verifyWebhookAuth($snapshot))->toBeFalse();
});
