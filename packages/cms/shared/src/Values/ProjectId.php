<?php

declare(strict_types=1);

namespace Cms\Shared\Values;

use InvalidArgumentException;

/** Идентификатор проекта (tenant). */
final readonly class ProjectId
{
    public function __construct(public string $value)
    {
        if ($value === '' || strlen($value) > 64) {
            throw new InvalidArgumentException('Project id must be a non-empty string up to 64 chars.');
        }
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
