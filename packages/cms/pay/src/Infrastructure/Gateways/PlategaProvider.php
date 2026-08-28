<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Gateways;

use Cms\Pay\Application\Exceptions\ProviderNotConfigured;
use Cms\Pay\Application\Exceptions\ProviderRequestFailed;
use Cms\Pay\Domain\Contracts\DeferredWebhookAuth;
use Cms\Pay\Domain\Contracts\PaymentProvider;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\ValueObjects\GatewayConfig;
use Cms\Shared\Values\Money;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * Шлюз Platega.io (Д5, blueprint `.ai/skills/payment-platega-integration-laravel`):
 * `POST /v2/transaction/process` с заголовками `X-MerchantId`/`X-Secret`,
 * суммы наружу — десятичные, внутри — минорные единицы. `id` в запросе не
 * отправляется никогда: идентификатор транзакции генерирует Platega, наш
 * ID платежа едет в `payload`, а её `transactionId` — в `provider_ref`.
 */
final class PlategaProvider implements DeferredWebhookAuth, PaymentProvider
{
    private const CREDENTIAL_MERCHANT_ID = 'merchant_id';

    private const CREDENTIAL_SECRET = 'secret';

    private GatewayConfig $config;

    public function __construct()
    {
        $this->config = GatewayConfig::empty();
    }

    public function key(): string
    {
        return 'platega';
    }

    public function configure(GatewayConfig $config): static
    {
        $this->config = $config;

        return $this;
    }

    public function createPayment(Payment $payment): array
    {
        $this->assertConfigured();

        $body = [
            'paymentDetails' => [
                'amount' => self::decimalAmount($payment->amount()),
                'currency' => $payment->currency,
            ],
            'description' => $payment->description ?? "Payment {$payment->id}",
            // Локальный ID платежа — в payload; антифрод Platega требует metadata.userId
            'payload' => $payment->id,
            'metadata' => ['userId' => $payment->user_key],
        ];

        if ($this->config->returnUrl !== null) {
            $body['return'] = $this->config->returnUrl;
        }

        if ($this->config->failUrl !== null) {
            $body['failedUrl'] = $this->config->failUrl;
        }

        $json = $this->send('post', '/v2/transaction/process', $body);

        $externalId = $json['transactionId'] ?? null;
        if (! is_string($externalId) || $externalId === '') {
            throw ProviderRequestFailed::malformed($this->key());
        }

        return [
            'external_id' => $externalId,
            // v2-эндпоинт отдаёт url, эндпоинт с preset-методом — redirect (защитный маппинг)
            'redirect_url' => $this->stringOrNull($json['url'] ?? $json['redirect'] ?? null),
            'status' => (self::mapStatus((string) ($json['status'] ?? '')) ?? PaymentStatus::Pending)->value,
        ];
    }

    public function refund(Payment $payment, Money $amount): array
    {
        $this->assertConfigured();

        $externalId = $payment->provider_ref;
        if ($externalId === null || $externalId === '') {
            throw ProviderRequestFailed::malformed($this->key());
        }

        // cancel-supported обязателен перед cancel (справочник Platega)
        $supported = $this->send('get', "/transaction/{$externalId}/cancel-supported");
        if (($supported['supported'] ?? false) !== true) {
            throw ProviderRequestFailed::refundNotSupported(
                $this->key(),
                $this->stringOrNull($supported['blockReason'] ?? null),
            );
        }

        $this->send('post', "/transaction/{$externalId}/cancel", []);

        return ['external_id' => $externalId, 'status' => 'refunded'];
    }

    public function verifyWebhook(Request $request): bool
    {
        // Фаза приёма (Д6): проект неизвестен — проверяется только форма
        // payload; подлинность секрета сверяется в конвейере обработки.
        $id = $request->input('id');
        $status = $request->input('status');

        return is_string($id) && $id !== '' && is_string($status) && $status !== '';
    }

    public function parseWebhook(array $payload): array
    {
        $rawStatus = (string) ($payload['status'] ?? '');
        $paymentId = $payload['payload'] ?? null;

        return [
            'external_id' => (string) ($payload['id'] ?? ''),
            // Неизвестный статус не коэрсируется: конвейер его не применит
            'status' => self::mapStatus($rawStatus)->value ?? $rawStatus,
            'payment_id' => is_string($paymentId) && $paymentId !== '' ? $paymentId : null,
        ];
    }

    public function webhookAuthSnapshot(Request $request): array
    {
        return [
            'merchant_id' => (string) $request->header('X-MerchantId'),
            // В БД уходит только хэш секрета, не сырое значение
            'secret_hash' => hash('sha256', (string) $request->header('X-Secret')),
        ];
    }

    /** Верификация callback в конвейере обработки (Д6): оба заголовка через hash_equals. */
    public function verifyWebhookAuth(?array $auth): bool
    {
        $expectedMerchant = $this->config->credential(self::CREDENTIAL_MERCHANT_ID);
        $expectedSecret = $this->config->credential(self::CREDENTIAL_SECRET);

        if ($expectedMerchant === null || $expectedSecret === null || $auth === null) {
            return false;
        }

        return hash_equals($expectedMerchant, (string) ($auth['merchant_id'] ?? ''))
            && hash_equals(hash('sha256', $expectedSecret), (string) ($auth['secret_hash'] ?? ''));
    }

    public static function mapStatus(string $status): ?PaymentStatus
    {
        return match ($status) {
            'PENDING' => PaymentStatus::Pending,
            'CONFIRMED' => PaymentStatus::Succeeded,
            'CANCELED' => PaymentStatus::Canceled,
            'CHARGEBACKED' => PaymentStatus::RefundedFull,
            default => null,
        };
    }

    private function assertConfigured(): void
    {
        if ($this->config->credential(self::CREDENTIAL_MERCHANT_ID) === null
            || $this->config->credential(self::CREDENTIAL_SECRET) === null) {
            throw ProviderNotConfigured::make($this->key());
        }
    }

    /**
     * Единственная точка конверсии минор → десятичные (Д5): целочисленная
     * арифметика, float возникает только на JSON-границе запроса.
     */
    private static function decimalAmount(Money $money): float
    {
        return (float) sprintf('%d.%02d', intdiv($money->amountMinor, 100), $money->amountMinor % 100);
    }

    /**
     * @param  array<string, mixed>|null  $body
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, ?array $body = null): array
    {
        try {
            $response = $method === 'get'
                ? $this->request()->get($path)
                : $this->request()->post($path, $body ?? []);
        } catch (ConnectionException $exception) {
            throw ProviderRequestFailed::connection($this->key(), $exception);
        }

        if ($response->failed()) {
            throw ProviderRequestFailed::fromStatus(
                $this->key(),
                $response->status(),
                $this->stringOrNull($response->json('code')),
            );
        }

        $json = $response->json();

        return is_array($json) ? $json : [];
    }

    private function request(): PendingRequest
    {
        /** @var array{base_url: string, timeout: int, connect_timeout: int} $config */
        $config = config('cms-pay.platega');

        return Http::baseUrl(rtrim($config['base_url'], '/'))
            ->acceptJson()
            ->asJson()
            ->withHeaders([
                'X-MerchantId' => (string) $this->config->credential(self::CREDENTIAL_MERCHANT_ID),
                'X-Secret' => (string) $this->config->credential(self::CREDENTIAL_SECRET),
            ])
            ->connectTimeout($config['connect_timeout'])
            ->timeout($config['timeout']);
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
