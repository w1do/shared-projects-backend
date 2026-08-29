<?php

declare(strict_types=1);

namespace Cms\Research\Application\DTOs\Buildout;

use Spatie\LaravelData\Data;

final class StartBuildoutDTO extends Data
{
    public function __construct(
        public string $topic,
        /** Перезаписывать уже заполненные поля проекта. */
        public bool $overwrite = false,
    ) {}

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{topic: string, overwrite?: bool} $data */
        return new self(topic: $data['topic'], overwrite: (bool) ($data['overwrite'] ?? false));
    }
}
