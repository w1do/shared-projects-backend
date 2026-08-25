<?php

declare(strict_types=1);

use Cms\Pay\Application\Commands\CreatePaymentCommand;
use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;
use Cms\Pay\Application\Handlers\CreatePaymentHandler;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\WebhookEvent;
use Cms\Pay\Infrastructure\Jobs\ProcessWebhookEventJob;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Queue;

/**
 * Guard задачи 0.8, обновлён change'ем fix-known-behavioral-defects (Д4, 7.9).
 *
 * Маршрут `POST /webhooks/{provider}` идёт БЕЗ auth-middleware, значит без
 * `ProjectContext`: продовый вебхук приходит от провайдера, а не от оператора.
 * `WebhookTest::nullPayment()` ставит контекст в хелпере, а scoped-инстанс
 * не сбрасывается между HTTP-вызовами внутри одного теста — здесь контекст
 * сбрасывается явно ПОСЛЕ подготовки платежа.
 *
 * Было: `WebhookEvent` без `project_id` вовсе (единственная бизнес-таблица
 * без тенант-колонки). Стало (7.9-A): приём без контекста по-прежнему
 * работает, `project_id` заполняется по платежу из payload — сразу при
 * регистрации, если платёж резолвится, иначе при обработке джобой; у события
 * с нерезолвируемым платежом остаётся NULL. Глобальный `BelongsToProject`
 * НЕ вешается (7.9-B): мутационно доказано, что скоуп ломает приём —
 * инвариант выполняется колонкой, см. докблок `WebhookEvent`.
 */

/** Платёж провайдера null: контекст ставится только на время создания. */
function guardPaymentWithoutContext(): Payment
{
    app(ProjectContext::class)->set('proj-1');

    $payment = app(CreatePaymentHandler::class)->handle(new CreatePaymentCommand(
        userKey: 'user:proj-1:7',
        data: CreatePaymentDTO::from(['amount_minor' => 100, 'currency' => 'RUB', 'provider' => 'null']),
    ));

    app(ProjectContext::class)->clear();
    expect(app(ProjectContext::class)->resolved())->toBeFalse();

    return $payment;
}

test('guard: 0.8 webhook is accepted with project context explicitly cleared', function () {
    Queue::fake([ProcessWebhookEventJob::class]);
    $payment = guardPaymentWithoutContext();

    $response = $this->postJson('/webhooks/null', [
        'id' => 'evt-no-context-1', 'status' => 'succeeded', 'payment_id' => $payment->id,
    ], ['X-Null-Signature' => 'valid-signature']);

    $response->assertOk();
    expect($response->json())->toBe(['received' => true]);
    ResponseSnapshot::assertMatches($response, 'webhook-no-context-accepted');

    // запись вебхука существует и читается без контекста проекта;
    // платёж зарезолвился уже при регистрации — project_id заполнен сразу
    $event = WebhookEvent::query()->where('external_id', 'evt-no-context-1')->sole();
    expect(WebhookEvent::query()->count())->toBe(1)
        ->and($event->provider)->toBe('null')
        ->and($event->status)->toBe('received')
        ->and($event->project_id)->toBe('proj-1')
        ->and($event->payload['payment_id'])->toBe($payment->id);

    // маршрут вебхука не резолвит контекст проекта — ни до, ни после запроса
    expect(app(ProjectContext::class)->resolved())->toBeFalse();

    Queue::assertPushedOn('webhooks', ProcessWebhookEventJob::class);
    Queue::assertPushed(ProcessWebhookEventJob::class, 1);
});

test('guard: 0.8 webhook without project context applies payment status end to end', function () {
    // без Queue::fake: QUEUE_CONNECTION=sync — джоба отрабатывает внутри запроса,
    // тоже без внешнего контекста проекта (контекст берётся из платежа и сбрасывается)
    $payment = guardPaymentWithoutContext();

    $this->postJson('/webhooks/null', [
        'id' => 'evt-no-context-2', 'status' => 'succeeded', 'payment_id' => $payment->id,
    ], ['X-Null-Signature' => 'valid-signature'])->assertOk();

    $event = WebhookEvent::query()->where('external_id', 'evt-no-context-2')->sole();
    $fresh = Payment::acrossProjects()->whereKey($payment->id)->sole();

    expect($event->status)->toBe('processed')
        ->and($event->project_id)->toBe('proj-1') // после обработки — проект платежа
        ->and($fresh->status->value)->toBe('succeeded')
        ->and($fresh->project_id)->toBe('proj-1')
        ->and($fresh->transactions()->withoutGlobalScope('project')->count())->toBe(1)
        ->and(app(ProjectContext::class)->resolved())->toBeFalse();
});

test('guard: 0.8 webhook with unresolvable payment is stored as failed with NULL project_id', function () {
    guardPaymentWithoutContext();

    $response = $this->postJson('/webhooks/null', [
        'id' => 'evt-no-context-5', 'status' => 'succeeded', 'payment_id' => 'pay-does-not-exist',
    ], ['X-Null-Signature' => 'valid-signature']);

    // Ответ неотличим от успешного приёма (дельта-спека: 200 {"received": true})
    $response->assertOk();
    expect($response->json())->toBe(['received' => true]);

    $event = WebhookEvent::query()->where('external_id', 'evt-no-context-5')->sole();

    // проекта нет ни при регистрации, ни при обработке — колонка остаётся NULL
    expect($event->status)->toBe('failed')
        ->and($event->project_id)->toBeNull()
        ->and(app(ProjectContext::class)->resolved())->toBeFalse();
});

test('guard: 0.8 unknown provider webhook without project context is 404 and stores nothing', function () {
    guardPaymentWithoutContext();

    $response = $this->postJson('/webhooks/stripe', [
        'id' => 'evt-no-context-3', 'status' => 'succeeded',
    ], ['X-Null-Signature' => 'valid-signature']);

    ResponseSnapshot::assertMatches($response, 'webhook-no-context-404-provider');
    expect(WebhookEvent::query()->count())->toBe(0);
});

test('guard: 0.8 invalid signature webhook without project context is 401 and stores nothing', function () {
    guardPaymentWithoutContext();

    $response = $this->postJson('/webhooks/null', [
        'id' => 'evt-no-context-4', 'status' => 'succeeded',
    ], ['X-Null-Signature' => 'wrong']);

    ResponseSnapshot::assertMatches($response, 'webhook-no-context-401-signature');
    expect(WebhookEvent::query()->count())->toBe(0);
});
