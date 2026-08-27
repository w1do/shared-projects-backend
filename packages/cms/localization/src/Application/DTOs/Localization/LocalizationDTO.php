<?php

declare(strict_types=1);

namespace Cms\Localization\Application\DTOs\Localization;

use Cms\Localization\Domain\Models\Localization;
use Spatie\LaravelData\Data;

final class LocalizationDTO extends Data
{
    public function __construct(
        public int $id,
        public string $service,
        public string $key,
        public string $locale,
        public ?string $value,
        public string $default_value,
    ) {}

    public static function fromModel(Localization $localization): self
    {
        return new self(
            id: $localization->id,
            service: $localization->service,
            key: $localization->key,
            locale: $localization->locale,
            value: $localization->value,
            default_value: $localization->default_value,
        );
    }
}
