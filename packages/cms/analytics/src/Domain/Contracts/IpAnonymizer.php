<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\Contracts;

/** Порт обезличивания IP: сырой адрес не покидает границу приёма (GDPR/152-ФЗ). */
interface IpAnonymizer
{
    public function hash(?string $ip): string;
}
