<?php

declare(strict_types=1);

use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Tenant\ProjectContext;
use Cms\Shared\Testing\ResponseSnapshot;

/**
 * Задача 0.6 — формы pay-списков (И5) и денежные типы (И4).
 *
 * Что защищается:
 *  - `GET /api/v1/pay/plans` — НЕпагинированная коллекция: все планы в `data`,
 *    ключа `meta` в теле нет. «Выравнивание» на курсор молча обрезало бы
 *    публичный каталог до одной страницы.
 *  - `GET /api/admin/v1/projects/{p}/pay/payments` — курсорная страница:
 *    в `data` не больше `per_page`, `meta` состоит РОВНО из
 *    `per_page`,`next_cursor`,`prev_cursor` (ни ключом больше, ни ключом меньше).
 *  - деньги на границе API — целые минорные единицы (`amount_minor`,
 *    `refunded_minor`, `price_minor`), в том числе в снимках: маска
 *    `ResponseSnapshot` не должна превращать их в `<int>`.
 *
 * Все фикстуры заданы явными значениями: faker в ассертах недопустим.
 */
function payGuardPayment(array $attrs = []): Payment
{
    app(ProjectContext::class)->set('proj-1');

    return Payment::create(array_merge([
        'subject_key' => 'user:proj-1:7',
        'amount_minor' => 10000,
        'currency' => 'RUB',
        'status' => 'succeeded',
        'provider' => 'manual',
        'provider_ref' => 'manual-guard-ref',
        'description' => 'Guard invoice',
    ], $attrs));
}

// ------------------------------------------------- (a) форма списка планов

test('guard: 0.6 public plans list returns all 60 plans and has no meta key', function () {
    // 60 активных планов с явными кодами и ценами: порядок задан price_minor
    for ($i = 1; $i <= 60; $i++) {
        makePlan([
            'code' => 'guard-plan-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
            'name' => 'Guard Plan '.$i,
            'price_minor' => 1000 + $i,
            'currency' => 'RUB',
            'interval' => 'month',
        ]);
    }

    $site = actingAsSiteUser();
    $response = $this->getJson('/api/v1/pay/plans', $site)->assertOk();

    $body = $response->json();

    // непагинированная коллекция: в теле только data, ключа meta нет вовсе
    expect(array_keys($body))->toBe(['data'])
        ->and($body)->not->toHaveKey('meta')
        ->and($body['data'])->toHaveCount(60);

    $response->assertJsonCount(60, 'data')->assertJsonMissingPath('meta');

    // порядок — orderBy(price_minor): первый и последний из 60 на месте
    expect($body['data'][0]['code'])->toBe('guard-plan-01')
        ->and($body['data'][0]['price_minor'])->toBe(1001)
        ->and($body['data'][59]['code'])->toBe('guard-plan-60')
        ->and($body['data'][59]['price_minor'])->toBe(1060);
});

// ---------------------------------------------- (b) форма списка платежей

test('guard: 0.6 admin payments list is a cursor page with exactly per_page next_cursor prev_cursor', function () {
    $headers = actingAsPayOperator();

    for ($i = 1; $i <= 60; $i++) {
        payGuardPayment(['amount_minor' => 1000 + $i, 'status' => 'pending', 'description' => 'Guard invoice '.$i]);
    }

    $first = $this->getJson('/api/admin/v1/projects/proj-1/pay/payments', $headers)->assertOk();
    $body = $first->json();

    // тело курсорной страницы: ровно data + meta
    expect(array_keys($body))->toBe(['data', 'meta']);

    // meta — РОВНО три ключа в этом порядке
    expect(array_keys($body['meta']))->toBe(['per_page', 'next_cursor', 'prev_cursor']);

    $perPage = $body['meta']['per_page'];
    expect($perPage)->toBeInt()->toBe(50)
        ->and(count($body['data']))->toBeLessThanOrEqual($perPage)
        ->and($body['data'])->toHaveCount(50)
        ->and($body['meta']['next_cursor'])->toBeString()->not->toBe('')
        ->and($body['meta']['prev_cursor'])->toBeNull();

    // вторая страница: остаток 10 из 60, курсоры зеркальны
    $second = $this->getJson(
        '/api/admin/v1/projects/proj-1/pay/payments?cursor='.$body['meta']['next_cursor'],
        $headers,
    )->assertOk();
    $secondBody = $second->json();

    expect(array_keys($secondBody))->toBe(['data', 'meta'])
        ->and(array_keys($secondBody['meta']))->toBe(['per_page', 'next_cursor', 'prev_cursor'])
        ->and($secondBody['data'])->toHaveCount(10)
        ->and(count($secondBody['data']))->toBeLessThanOrEqual($secondBody['meta']['per_page'])
        ->and($secondBody['meta']['next_cursor'])->toBeNull()
        ->and($secondBody['meta']['prev_cursor'])->toBeString()->not->toBe('');
});

test('guard: 0.6 site subscriptions list has no meta while admin subscriptions list has meta', function () {
    // Реальное поведение отличается от формулировки design.md (Б8: «GET /pay/subscriptions — с meta»):
    // meta есть только у АДМИНСКОГО списка (ApiResponse::cursorPage), сайтовый `mine`
    // отдаёт ApiResponse::data — непагинированную коллекцию без meta.
    $plan = makePlan([
        'code' => 'guard-mine',
        'name' => 'Guard Mine',
        'price_minor' => 5500,
        'currency' => 'RUB',
        'interval' => 'month',
    ]);
    app(ProjectContext::class)->set('proj-1');
    Subscription::create([
        'subscriber_type' => 'site_user',
        'subscriber_id' => '7',
        'subject_type' => 'plan',
        'subject_id' => (string) $plan->id,
        'status' => 'active',
        'current_period_ends_at' => now()->addMonth(),
    ]);

    $site = actingAsSiteUser();
    $mine = $this->getJson('/api/v1/pay/subscriptions', $site)->assertOk();

    expect(array_keys($mine->json()))->toBe(['data'])
        ->and($mine->json())->not->toHaveKey('meta')
        ->and($mine->json('data'))->toHaveCount(1)
        ->and($mine->json('data.0.subject.price_minor'))->toBeInt()->toBe(5500);

    $headers = actingAsPayOperator();
    $admin = $this->getJson('/api/admin/v1/projects/proj-1/pay/subscriptions', $headers)->assertOk();

    expect(array_keys($admin->json()))->toBe(['data', 'meta'])
        ->and(array_keys($admin->json('meta')))->toBe(['per_page', 'next_cursor', 'prev_cursor']);
});

// ------------------------------------------------------ (c) типы денег

test('guard: 0.6 payment money fields are integers in admin list', function () {
    $headers = actingAsPayOperator();
    $payment = payGuardPayment(['amount_minor' => 10000]);

    $this->postJson(
        "/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund",
        ['amount_minor' => 2500],
        $headers,
    )->assertOk();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/payments', $headers)->assertOk();
    $data = $response->json('data');

    expect($data[0]['amount_minor'])->toBeInt()->toBe(10000)
        ->and($data[0]['refunded_minor'])->toBeInt()->toBe(2500)
        ->and($response->json('meta.per_page'))->toBeInt();

    // в сыром JSON деньги не в кавычках — строковый minor не пройдёт даже численно равным
    $raw = (string) $response->getContent();
    expect($raw)->toContain('"amount_minor":10000')
        ->and($raw)->toContain('"refunded_minor":2500')
        ->and($raw)->not->toContain('"amount_minor":"10000"')
        ->and($raw)->not->toContain('"refunded_minor":"2500"');
});

test('guard: 0.6 subscribe response money fields are integers', function () {
    makePlan([
        'code' => 'guard-pro',
        'name' => 'Guard Pro',
        'price_minor' => 19900,
        'currency' => 'RUB',
        'interval' => 'month',
    ]);

    $site = actingAsSiteUser();
    $response = $this->postJson('/api/v1/pay/subscriptions', ['plan_code' => 'guard-pro'], $site)->assertCreated();

    expect($response->json('data.payment.amount_minor'))->toBeInt()->toBe(19900)
        ->and($response->json('data.payment.refunded_minor'))->toBeInt()->toBe(0)
        ->and($response->json('data.subscription.subject.price_minor'))->toBeInt()->toBe(19900);

    $raw = (string) $response->getContent();
    expect($raw)->toContain('"amount_minor":19900')
        ->and($raw)->not->toContain('"amount_minor":"19900"');
});

test('guard: 0.6 snapshot mask keeps money as integer and masks only ids and timestamps', function () {
    $headers = actingAsPayOperator();
    $payment = payGuardPayment(['amount_minor' => 10000, 'description' => 'Guard invoice']);

    $this->postJson(
        "/api/admin/v1/projects/proj-1/pay/payments/{$payment->id}/refund",
        ['amount_minor' => 2500],
        $headers,
    )->assertOk();

    $response = $this->getJson('/api/admin/v1/projects/proj-1/pay/payments', $headers)->assertOk();

    ResponseSnapshot::assertMatches($response, 'guard-0-6-payment-money-types');

    // Снимок — второй контур защиты: маска обязана сохранить ЧИСЛО у денег
    // и при этом замаскировать недетерминированные id/даты.
    $snapshot = json_decode(
        (string) file_get_contents(__DIR__.'/__snapshots__/guard-0-6-payment-money-types.json'),
        true,
        512,
        JSON_THROW_ON_ERROR,
    );

    $row = $snapshot['body']['data'][0];

    expect($row['amount_minor'])->toBeInt()->toBe(10000)
        ->and($row['refunded_minor'])->toBeInt()->toBe(2500)
        ->and($snapshot['body']['meta']['per_page'])->toBeInt()->toBe(50)
        ->and($row['id'])->toBe('<string>')
        ->and($row['created_at'])->toBe('<string>')
        ->and($row['currency'])->toBe('RUB')
        ->and($row['status'])->toBe('refunded_partial');
});
