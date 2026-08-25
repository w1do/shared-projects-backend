<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Models\ProjectSetting;

/**
 * Запись одного значения настройки проекта.
 *
 * Признак секретности берётся из схемы манифеста, а не из запроса: шифрование
 * и маскировка в ответе завязаны именно на него.
 */
final class SettingWriter
{
    public function write(string $projectId, string $service, string $key, mixed $value, bool $secret): ProjectSetting
    {
        $setting = ProjectSetting::query()->firstOrNew([
            'project_id' => $projectId,
            'service' => $service,
            'key' => $key,
        ]);

        $setting->secret = $secret;
        $setting->setPlainValue($value);
        $setting->save();

        return $setting;
    }
}
