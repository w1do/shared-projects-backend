<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\UpsertProviderAccountCommand;
use Cms\Pay\Application\DTOs\ProviderAccount\ProviderAccountDTO;
use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Infrastructure\Gateways\ProviderCatalog;
use Spatie\LaravelData\Optional;

/**
 * Upsert настроек провайдера (Д1/Д2): одна запись на (project, provider),
 * непереданные поля не трогаются, метаданные новой записи добираются
 * из каталога провайдеров.
 */
final class UpsertProviderAccountHandler
{
    public function handle(UpsertProviderAccountCommand $command): ProviderAccountDTO
    {
        $data = $command->data;

        $account = ProviderAccount::query()->where('provider', $data->provider)->first()
            ?? new ProviderAccount(['provider' => $data->provider]);

        $metadata = ProviderCatalog::metadataFor($data->provider);

        if (! $data->group instanceof Optional) {
            $account->group = $data->group;
        } elseif (! $account->exists) {
            $account->group = $metadata['group'];
        }

        if (! $data->label instanceof Optional) {
            $account->label = $data->label;
        } elseif (! $account->exists) {
            $account->label = $metadata['label'];
        }

        if (! $data->name instanceof Optional) {
            $account->name = $data->name;
        } elseif (! $account->exists) {
            $account->name = $metadata['name'];
        }

        if (! $data->credentials instanceof Optional) {
            $account->credentials = $data->credentials;
        }

        if (! $data->properties instanceof Optional) {
            $account->properties = $data->properties;
        }

        if (! $data->return_url instanceof Optional) {
            $account->return_url = $data->return_url;
        }

        if (! $data->fail_url instanceof Optional) {
            $account->fail_url = $data->fail_url;
        }

        if (! $data->status instanceof Optional) {
            // Строка провалидирована FormRequest-ом по enum-правилу
            $account->status = ProviderStatus::from($data->status);
        }

        $account->save();

        return ProviderAccountDTO::fromModel($account);
    }
}
