<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\License;
use DateTimeInterface;

/**
 * Перевыпуск payload той же лицензии с новым сроком (Д15):
 * активационный ключ и запись сохраняются.
 */
final readonly class ReissueLicenseCommand
{
    public function __construct(
        public License $license,
        public DateTimeInterface $expiresAt,
    ) {}
}
