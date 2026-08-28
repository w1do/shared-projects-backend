<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\ProviderAccount;

use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Infrastructure\Gateways\ProviderCatalog;
use Spatie\LaravelData\Data;

/** Полный срез настроек провайдера; credentials наружу отдаёт только show-Resource. */
final class ProviderAccountDTO extends Data
{
    /**
     * @param  array<string, mixed>  $credentials
     * @param  array<string, mixed>  $properties
     */
    public function __construct(
        public string $provider,
        public string $group,
        public ?string $label,
        public ?string $name,
        public array $credentials,
        public array $properties,
        public ?string $return_url,
        public ?string $fail_url,
        public string $status,
        public bool $has_credentials,
    ) {}

    public static function fromModel(ProviderAccount $account): self
    {
        return new self(
            provider: $account->provider,
            group: $account->group,
            label: $account->label,
            name: $account->name,
            credentials: $account->credentials ?? [],
            properties: $account->properties ?? [],
            return_url: $account->return_url,
            fail_url: $account->fail_url,
            status: $account->status->value,
            has_credentials: $account->hasCredentials(),
        );
    }

    /** Пустая заготовка ненастроенного провайдера: дефолты каталога, статус active. */
    public static function blank(string $provider): self
    {
        $metadata = ProviderCatalog::metadataFor($provider);

        return new self(
            provider: $provider,
            group: $metadata['group'],
            label: $metadata['label'],
            name: $metadata['name'],
            credentials: [],
            properties: [],
            return_url: null,
            fail_url: null,
            status: ProviderStatus::Active->value,
            has_credentials: false,
        );
    }
}
