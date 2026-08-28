<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;

final readonly class CreatePaymentCommand
{
    /** @param string $subjectKey субъект-ключ плательщика для аналитики/антифрода (Д13) */
    public function __construct(
        public string $subjectKey,
        public CreatePaymentDTO $data,
        public ?string $idempotencyKey = null,
        public ?string $subscriptionId = null,
    ) {}
}
