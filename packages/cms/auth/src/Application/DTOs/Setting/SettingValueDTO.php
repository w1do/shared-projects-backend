<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Setting;

use Cms\Auth\Domain\Models\ProjectSetting;
use Spatie\LaravelData\Data;

final class SettingValueDTO extends Data
{
    public function __construct(
        public string $key,
        public mixed $value,
        public bool $secret,
    ) {}

    public static function fromModel(ProjectSetting $setting): self
    {
        return new self(
            key: $setting->key,
            value: $setting->displayValue(), // секреты замаскированы
            secret: $setting->secret,
        );
    }
}
