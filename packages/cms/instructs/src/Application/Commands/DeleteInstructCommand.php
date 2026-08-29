<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Commands;

final readonly class DeleteInstructCommand
{
    public function __construct(public int $instructId) {}
}
