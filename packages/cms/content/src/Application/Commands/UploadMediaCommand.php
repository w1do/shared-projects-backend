<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Illuminate\Http\UploadedFile;

/** Команда-намерение: данные для UploadMediaHandler. */
final readonly class UploadMediaCommand
{
    public function __construct(
        public UploadedFile $file,
        public ?string $alt = null,
    ) {}
}
