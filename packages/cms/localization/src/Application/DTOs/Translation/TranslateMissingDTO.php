<?php

declare(strict_types=1);

namespace Cms\Localization\Application\DTOs\Translation;

use Spatie\LaravelData\Data;

/** Набор записей для автоперевода: null — весь словарь проекта. */
final class TranslateMissingDTO extends Data
{
    public function __construct(
        /** @var list<int>|null */
        public ?array $ids = null,
    ) {}

    /** @param array<string, mixed> $data провалидированные данные запроса */
    public static function fromValidated(array $data): self
    {
        $ids = $data['ids'] ?? null;

        // Элементы приводятся к int — как и до выделения FormRequest.
        return new self(ids: is_array($ids) ? array_map(intval(...), array_values($ids)) : null);
    }
}
