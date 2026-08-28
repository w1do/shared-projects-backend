<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

use Cms\Licensing\Domain\Models\License;

final readonly class RevokeLicenseCommand
{
    public function __construct(public License $license) {}
}
