<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Application\DTOs\Payment\CreatePaymentDTO;

final readonly class CreatePaymentCommand
{
    public function __construct(
        public string $userKey,
        public CreatePaymentDTO $data,
        public ?string $idempotencyKey = null,
        public ?string $subscriptionId = null,
    ) {}
}
