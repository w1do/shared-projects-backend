<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

/** Команда-намерение: данные для SetTranslationsVersionHandler. */
final readonly class SetTranslationsVersionCommand
{
    public function __construct(
        public string $projectId,
        public int $version,
    ) {}
}
