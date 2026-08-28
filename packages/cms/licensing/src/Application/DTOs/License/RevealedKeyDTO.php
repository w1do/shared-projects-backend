<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\License;

use Spatie\LaravelData\Data;

/** Однократный показ ключа авто-выпущенной лицензии (Д8). */
final class RevealedKeyDTO extends Data
{
    public function __construct(public string $key) {}
}
