<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\ProviderAccount\ProviderAccountDTO;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Illuminate\Support\Collection;

/**
 * Список настроек провайдеров проекта: каждый провайдер реестра — строкой,
 * ненастроенные — пустой заготовкой с дефолтами каталога. Значения
 * credentials в список не попадают (Resource отдаёт только has_credentials).
 */
final class ListProviderAccountsQuery
{
    /** @return Collection<int, ProviderAccountDTO> */
    public function handle(): Collection
    {
        $accounts = ProviderAccount::query()->get()->keyBy('provider');

        $known = collect(ProviderRegistry::available())
            ->map(function (string $provider) use ($accounts): ProviderAccountDTO {
                $account = $accounts->get($provider);

                return $account === null
                    ? ProviderAccountDTO::blank($provider)
                    : ProviderAccountDTO::fromModel($account);
            });

        // Записи вне реестра (исторические провайдеры) не скрываем.
        // toBase: у Eloquent-коллекции except() фильтрует по первичным
        // ключам моделей, а нужна фильтрация по ключам коллекции.
        $extra = $accounts->toBase()->except(ProviderRegistry::available())->sortKeys()->values()
            ->map(fn (ProviderAccount $account): ProviderAccountDTO => ProviderAccountDTO::fromModel($account));

        return $known->concat($extra)->values();
    }
}
