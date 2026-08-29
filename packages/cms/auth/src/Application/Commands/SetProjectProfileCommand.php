<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

final readonly class SetProjectProfileCommand
{
    public function __construct(
        public string $projectId,
        public ?string $description = null,
        public ?string $topic = null,
        /** Заполненные поля перезаписываются только по явному согласию оператора. */
        public bool $overwrite = false,
    ) {}
}
