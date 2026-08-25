<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Manifest;

use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Spatie\LaravelData\Data;

/** Подтверждение регистрации манифеста: что именно зафиксировано в реестре. */
final class PublishedManifestDTO extends Data
{
    public function __construct(
        public string $key,
        public string $version,
    ) {}

    public static function fromModel(ServiceManifestRecord $record): self
    {
        return new self(key: $record->key, version: $record->version);
    }
}
