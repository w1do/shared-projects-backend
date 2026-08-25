<?php

declare(strict_types=1);

namespace Cms\Shared\Tenant;

/**
 * Контекст текущего проекта. Регистрируется строго как scoped():
 * под Octane состояние не переживает запрос — иначе утечка данных между проектами.
 */
final class ProjectContext
{
    private ?string $projectId = null;

    public function set(string $projectId): void
    {
        $this->projectId = $projectId;
    }

    public function clear(): void
    {
        $this->projectId = null;
    }

    public function id(): ?string
    {
        return $this->projectId;
    }

    public function required(): string
    {
        if ($this->projectId === null) {
            throw new MissingProjectContext('Project context has not been resolved for this request.');
        }

        return $this->projectId;
    }

    public function resolved(): bool
    {
        return $this->projectId !== null;
    }
}
