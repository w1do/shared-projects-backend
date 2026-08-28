<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\UpsertOrganizationCommand;
use Cms\Licensing\Domain\Models\Organization;
use Spatie\LaravelData\Optional;

final class UpsertOrganizationHandler
{
    public function handle(UpsertOrganizationCommand $command): Organization
    {
        $data = $command->data;
        $organization = $command->organization ?? new Organization;

        $organization->name = $data->name;
        $organization->contact_first_name = $data->contact_first_name;
        $organization->contact_last_name = $data->contact_last_name;
        $organization->email = $data->email;

        // Optional-семантика (И1): непереданные поля анкеты не трогаются
        if (! $data->phone instanceof Optional) {
            $organization->phone = $data->phone;
        }
        if (! $data->telegram instanceof Optional) {
            $organization->telegram = $data->telegram;
        }
        if (! $data->activity instanceof Optional) {
            $organization->activity = $data->activity;
        }
        if (! $data->employees_count instanceof Optional) {
            $organization->employees_count = $data->employees_count;
        }
        if (! $data->usage_purpose instanceof Optional) {
            $organization->usage_purpose = $data->usage_purpose;
        }

        $organization->save();

        return $organization;
    }
}
