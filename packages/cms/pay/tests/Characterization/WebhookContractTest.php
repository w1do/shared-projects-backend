<?php

declare(strict_types=1);

use Cms\Pay\Infrastructure\Jobs\ProcessWebhookEventJob;
use Cms\Shared\Testing\ResponseSnapshot;
use Illuminate\Support\Facades\Queue;

/**
 * Характеризационные снимки контракта вебхуков pay (routes/webhooks.php).
 * Ручной ответ ProviderWebhookController — {"received": true} мимо конверта
 * ApiResponse — фиксируется как есть: рефакторинг не должен его «выровнять».
 */
beforeEach(function () {
    Queue::fake([ProcessWebhookEventJob::class]);
});

test('contract: pay webhook accepted', function () {
    $response = $this->postJson('/webhooks/null', [
        'id' => 'evt-1', 'status' => 'succeeded', 'payment_id' => null,
    ], ['X-Null-Signature' => 'valid-signature']);

    ResponseSnapshot::assertMatches($response, 'webhook-accepted');
});

test('contract: pay webhook duplicate', function () {
    $payload = ['id' => 'evt-1', 'status' => 'succeeded', 'payment_id' => null];
    $headers = ['X-Null-Signature' => 'valid-signature'];

    $this->postJson('/webhooks/null', $payload, $headers)->assertOk();

    // дубль по (provider, external_id) тоже 200: провайдер не должен ретраить
    ResponseSnapshot::assertMatches($this->postJson('/webhooks/null', $payload, $headers), 'webhook-duplicate');
});

test('contract: pay webhook invalid signature', function () {
    $response = $this->postJson('/webhooks/null', ['id' => 'evt-1'], ['X-Null-Signature' => 'wrong']);

    ResponseSnapshot::assertMatches($response, 'webhook-401');
});

test('contract: pay webhook without signature', function () {
    ResponseSnapshot::assertMatches($this->postJson('/webhooks/null', ['id' => 'evt-1']), 'webhook-401-no-signature');
});

test('contract: pay webhook unknown provider', function () {
    ResponseSnapshot::assertMatches($this->postJson('/webhooks/stripe', ['id' => 'evt-1']), 'webhook-404');
});

test('contract: pay webhook manual provider never verifies', function () {
    // manual — известный провайдер, но вебхуков не принимает: 401, не 404
    ResponseSnapshot::assertMatches($this->postJson('/webhooks/manual', ['id' => 'evt-1']), 'webhook-401-manual');
});

test('contract: pay webhook missing external id', function () {
    $response = $this->postJson('/webhooks/null', ['status' => 'succeeded'], ['X-Null-Signature' => 'valid-signature']);

    ResponseSnapshot::assertMatches($response, 'webhook-422');
});
