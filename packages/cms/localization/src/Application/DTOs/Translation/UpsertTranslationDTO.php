<?php

declare(strict_types=1);

namespace Cms\Localization\Application\DTOs\Translation;

use Illuminate\Foundation\Http\FormRequest;
use Spatie\LaravelData\Data;

/** Чистая структура между слоями: валидация — в FormRequest. */
final class UpsertTranslationDTO extends Data
{
    public function __construct(
        public string $key,
        /** @var array<string, string> локаль → значение */
        public array $values,
    ) {}

    public static function fromRequest(FormRequest $request): self
    {
        /** @var array{key: string, values: array<string, string>} $data */
        $data = $request->validated();

        return new self(key: $data['key'], values: $data['values']);
    }
}
