<?php

declare(strict_types=1);

namespace Cms\Localization\Application\DTOs\Translation;

use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest, HTTP сюда не попадает. */
final class UpsertTranslationDTO extends Data
{
    public function __construct(
        public string $key,
        /** @var array<string, string> локаль → значение */
        public array $values,
    ) {}

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        /** @var array{key: string, values: array<string, string>} $data */
        return new self(key: $data['key'], values: $data['values']);
    }
}
