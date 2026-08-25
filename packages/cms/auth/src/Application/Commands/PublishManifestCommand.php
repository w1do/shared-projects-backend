<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Commands;

use Cms\Contracts\Manifest\ServiceManifest;

/** Команда-намерение: данные для PublishManifestHandler. */
final readonly class PublishManifestCommand
{
    public function __construct(
        public ServiceManifest $manifest,
    ) {}
}
