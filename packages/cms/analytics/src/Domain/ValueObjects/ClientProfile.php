<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\ValueObjects;

/** Срез клиента для отчётов: результат разбора User-Agent. */
final readonly class ClientProfile
{
    public function __construct(
        public string $device,
        public string $os,
        public string $browser,
    ) {}
}
