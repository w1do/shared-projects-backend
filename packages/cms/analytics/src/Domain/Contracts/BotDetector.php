<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\Contracts;

/** Порт распознавания ботов по User-Agent. */
interface BotDetector
{
    public function isBot(?string $userAgent): bool;
}
