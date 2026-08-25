<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Payment;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Внутренний DTO создания платежа: HTTP-поверхности у него нет — платёж
 * создают только `SubscribeHandler` и `RenewSubscriptionHandler`. Прежние
 * `rules()` не применялись ни к одному запросу и сняты вместе с остальными
 * (валидация живёт в FormRequest'ах); отдельный FormRequest здесь не нужен.
 */
final class CreatePaymentDTO extends Data
{
    public function __construct(
        public int $amount_minor,
        public string $currency,
        public string|Optional|null $description,
        public string|Optional $provider,
    ) {}
}
