<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\PutSettingsCommand;
use Cms\Auth\Domain\Models\ProjectSetting;
use Cms\Auth\Domain\Models\ServiceManifestRecord;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Contracts\Manifest\ServiceManifest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Настройки сервиса на проект: валидация по схеме из манифеста,
 * секретные значения шифруются и не возвращаются в открытом виде.
 */
final class PutSettingsHandler
{
    /** @return list<ProjectSetting> */
    public function handle(PutSettingsCommand $command): array
    {
        $record = ServiceManifestRecord::query()->find($command->service);
        if ($record === null) {
            throw ValidationException::withMessages(['service' => ['Service manifest is not registered.']]);
        }

        $manifest = ServiceManifest::fromArray((array) $record->manifest);
        $definitions = collect($manifest->settings)->keyBy('key');

        $rules = [];
        foreach ($command->data->values as $key => $value) {
            $definition = $definitions->get($key);
            if ($definition === null) {
                throw ValidationException::withMessages(["values.{$key}" => ['Unknown setting.']]);
            }
            if ($definition->rules !== []) {
                $rules["values.{$key}"] = $definition->rules;
            }
        }

        Validator::make(['values' => $command->data->values], $rules)->validate();

        $saved = [];
        foreach ($command->data->values as $key => $value) {
            $definition = $definitions->get($key);
            if ($definition === null) {
                continue; // уже отвергнуто валидацией выше
            }

            $setting = ProjectSetting::query()->firstOrNew([
                'project_id' => $command->project->id,
                'service' => $command->service,
                'key' => $key,
            ]);
            $setting->secret = $definition->secret;
            $setting->setPlainValue($value);
            $setting->save();

            $saved[] = $setting;
        }

        Audit::record('settings.updated', $command->project->id, "service:{$command->service}", [
            'keys' => array_keys($command->data->values), // значения в аудит не пишем — среди них секреты
        ]);

        return $saved;
    }
}
