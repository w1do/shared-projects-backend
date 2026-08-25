<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Audit;

use Cms\Auth\Domain\Models\AuditLog;
use Spatie\LaravelData\Data;

final class AuditEntryDTO extends Data
{
    public function __construct(
        public int $id,
        public string $actor_type,
        public ?string $actor_id,
        public string $action,
        public ?string $subject,
        public ?array $changes,
        public ?string $created_at,
    ) {}

    public static function fromModel(AuditLog $log): self
    {
        return new self(
            id: $log->id,
            actor_type: $log->actor_type,
            actor_id: $log->actor_id,
            action: $log->action,
            subject: $log->subject,
            changes: $log->changes,
            created_at: $log->created_at?->toIso8601String(),
        );
    }
}
