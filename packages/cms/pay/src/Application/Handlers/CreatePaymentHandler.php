<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Shared\Tenant\ProjectContext;
use Spatie\LaravelData\Optional;

/** Создание платежа: идемпотентно по ключу, проведение через адаптер провайдера. */
final class CreatePaymentHandler
{
    public function __construct(
        private readonly ProviderRegistry $providers,
        private readonly ProjectContext $context,
    ) {}

    public function handle(CreatePaymentCommand $command): Payment
    {
        if ($command->idempotencyKey !== null) {
            $existing = Payment::query()->where('idempotency_key', $command->idempotencyKey)->first();
            if ($existing !== null) {
                return $existing; // повтор с тем же ключом — без второго платежа
            }
        }

        $data = $command->data;
        $providerKey = $data->provider instanceof Optional ? 'manual' : $data->provider;

        $payment = Payment::create([
            'user_key' => $command->userKey,
            'amount_minor' => $data->amount_minor,
            'currency' => $data->currency,
            'description' => $data->description instanceof Optional ? null : $data->description,
            'provider' => $providerKey,
            'idempotency_key' => $command->idempotencyKey,
            'subscription_id' => $command->subscriptionId,
        ]);

        $result = $this->providers->for($this->context->required(), $providerKey)->createPayment($payment);

        $payment->forceFill([
            'provider_ref' => $result['external_id'],
            'status' => $result['status'],
        ])->save();

        return $payment;
    }
}
