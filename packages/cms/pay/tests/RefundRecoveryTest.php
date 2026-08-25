<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Application\DTOs\Payment\RefundDTO;
use Cms\Pay\Application\Handlers\RefundPaymentHandler;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Events\Dispatcher;
use Psr\Log\AbstractLogger;

/**
 * Д2: падение записи возврата ПОСЛЕ успешного возврата у провайдера
 * не проходит молча — критический лог с полным контекстом + rethrow.
 */
test('refund persist failure after provider success leaves a critical log and rethrows', function () {
    app(ProjectContext::class)->set('proj-1');
    $payment = Payment::create([
        'user_key' => 'user:proj-1:7',
        'amount_minor' => 5000,
        'currency' => 'RUB',
        'status' => 'succeeded',
        'provider' => 'manual',
    ]);

    // Транзакция падает на диспатче PaymentRefunded — запись уже внутри неё
    $events = Mockery::mock(Dispatcher::class);
    $events->shouldReceive('dispatch')->andThrow(new RuntimeException('db down'));

    // Шпион-логгер: собирает записи вместо реального канала
    $logger = new class extends AbstractLogger
    {
        /** @var list<array{0: mixed, 1: string, 2: array<string, mixed>}> */
        public array $records = [];

        public function log($level, Stringable|string $message, array $context = []): void
        {
            $this->records[] = [$level, (string) $message, $context];
        }
    };

    $handler = new RefundPaymentHandler(app(ProviderRegistry::class), $events, $logger);

    expect(fn () => $handler->handle(new RefundPaymentCommand($payment, RefundDTO::from([]))))
        ->toThrow(RuntimeException::class, 'db down');

    expect($logger->records)->toHaveCount(1);
    [$level, $message, $context] = $logger->records[0];
    expect($level)->toBe('critical')
        ->and($message)->toBe('pay.refund.persist_failed')
        ->and($context)->toBe([
            'payment_id' => $payment->id,
            'provider' => 'manual',
            'amount_minor' => 5000,
            'currency' => 'RUB',
        ]);

    // Транзакция откатилась: платёж в БД не тронут
    $fresh = Payment::query()->findOrFail($payment->id);
    expect($fresh->refunded_minor)->toBe(0)
        ->and($fresh->status->value)->toBe('succeeded');
});
