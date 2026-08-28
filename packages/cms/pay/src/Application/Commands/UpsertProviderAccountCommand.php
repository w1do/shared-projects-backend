<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Application\DTOs\ProviderAccount\UpsertProviderAccountDTO;

final readonly class UpsertProviderAccountCommand
{
    public function __construct(public UpsertProviderAccountDTO $data) {}
}
