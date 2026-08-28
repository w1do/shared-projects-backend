<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\SigningKey;

use Spatie\LaravelData\Data;

/** Публичный ключ проекта — единственное, что покидает хранилище пары (Д3). */
final class PublicKeyDTO extends Data
{
    public function __construct(public string $public_key) {}
}
