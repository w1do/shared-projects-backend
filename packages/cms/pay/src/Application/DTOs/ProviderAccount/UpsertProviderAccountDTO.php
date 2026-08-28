<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\ProviderAccount;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/** Вход upsert-сохранения настроек провайдера: непереданное поле остаётся Optional (И1). */
final class UpsertProviderAccountDTO extends Data
{
    public function __construct(
        public string $provider,
        public string|Optional $group,
        public string|Optional|null $label,
        public string|Optional|null $name,
        public array|Optional $credentials,
        public array|Optional $properties,
        public string|Optional|null $return_url,
        public string|Optional|null $fail_url,
        public string|Optional $status,
    ) {}
}
