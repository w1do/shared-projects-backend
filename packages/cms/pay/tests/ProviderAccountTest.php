<?php

declare(strict_types=1);

use Cms\Pay\Domain\Contracts\PaymentProvider;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Infrastructure\Gateways\NullProvider;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Shared\Values\Money;
use Illuminate\Http\Request;

/**
 * Двойник адаптера: фиксирует, вызвали ли configure() и с чем именно.
 * Подменяет NullProvider в контейнере — реестр резолвит класс адаптера
 * через контейнер, поведение самих manual/null не трогается.
 */
final class SpyPaymentProvider implements PaymentProvider
{
    public bool $configured = false;

    /** @var array<string, mixed> */
    public array $credentials = [];

    public function key(): string
    {
        return 'null';
    }

    public function configure(array $credentials): static
    {
        $this->configured = true;
        $this->credentials = $credentials;

        return $this;
    }

    public function createPayment(Payment $payment): array
    {
        return ['external_id' => null, 'redirect_url' => null, 'status' => 'pending'];
    }

    public function refund(Payment $payment, Money $amount): array
    {
        return ['external_id' => null, 'status' => 'refunded'];
    }

    public function verifyWebhook(Request $request): bool
    {
        return true;
    }

    public function parseWebhook(array $payload): array
    {
        return ['external_id' => '', 'status' => 'unknown', 'payment_id' => null];
    }
}

function spyProvider(): SpyPaymentProvider
{
    $spy = new SpyPaymentProvider;
    app()->instance(NullProvider::class, $spy);

    return $spy;
}

test('registry configures the adapter with the credentials of its project', function () {
    ProviderAccount::create(['project_id' => 'proj-1', 'provider' => 'null', 'credentials' => ['api_key' => 'secret-1']]);
    ProviderAccount::create(['project_id' => 'proj-2', 'provider' => 'null', 'credentials' => ['api_key' => 'secret-2']]);

    $spy = spyProvider();
    app(ProviderRegistry::class)->for('proj-1', 'null');

    expect($spy->configured)->toBeTrue()
        ->and($spy->credentials)->toBe(['api_key' => 'secret-1']);
});

test('registry skips configuration for the webhook verify placeholder and for a project without an account', function () {
    ProviderAccount::create(['project_id' => 'proj-1', 'provider' => 'null', 'credentials' => ['api_key' => 'secret-1']]);

    $spy = spyProvider();
    app(ProviderRegistry::class)->for(ProviderRegistry::WITHOUT_PROJECT, 'null');
    app(ProviderRegistry::class)->for('proj-without-account', 'null');

    expect($spy->configured)->toBeFalse()
        ->and($spy->credentials)->toBe([]);
});

test('registry passes empty credentials when the account stores none', function () {
    ProviderAccount::create(['project_id' => 'proj-1', 'provider' => 'null', 'credentials' => null]);

    $spy = spyProvider();
    app(ProviderRegistry::class)->for('proj-1', 'null');

    expect($spy->configured)->toBeTrue()
        ->and($spy->credentials)->toBe([]);
});
