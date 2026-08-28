<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\ProviderAccount\ProviderAccountDTO;
use Cms\Pay\Application\Exceptions\UnknownPaymentProvider;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;

/**
 * Полные настройки провайдера (включая расшифрованные credentials) — для формы
 * редактирования и копирования между проектами. Ненастроенный провайдер —
 * пустая заготовка, не 404 (Д3).
 */
final class GetProviderAccountQuery
{
    public function handle(string $provider): ProviderAccountDTO
    {
        if (! in_array($provider, ProviderRegistry::available(), true)) {
            throw UnknownPaymentProvider::make($provider);
        }

        $account = ProviderAccount::query()->where('provider', $provider)->first();

        return $account === null
            ? ProviderAccountDTO::blank($provider)
            : ProviderAccountDTO::fromModel($account);
    }
}
