<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\DTOs\Release;

use Cms\Licensing\Domain\Models\Release;
use Spatie\LaravelData\Data;

final class ReleaseDTO extends Data
{
    public function __construct(
        public int $id,
        public string $version,
        public string $train,
        public string $repository,
        public string $released_at,
        public bool $is_security,
        public ?string $min_upgrade_from,
        public ?string $changelog_url,
    ) {}

    public static function fromModel(Release $release): self
    {
        return new self(
            id: $release->id,
            version: $release->version,
            train: $release->train,
            repository: $release->repository,
            released_at: $release->released_at->toIso8601String(),
            is_security: $release->is_security,
            min_upgrade_from: $release->min_upgrade_from,
            changelog_url: $release->changelog_url,
        );
    }
}
