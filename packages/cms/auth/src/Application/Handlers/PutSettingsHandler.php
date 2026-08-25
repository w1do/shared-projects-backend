<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\PutSettingsCommand;
use Cms\Auth\Application\Queries\ServiceSettingsSchemaQuery;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\ProjectSetting;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\SettingWriter;
use Cms\Contracts\Manifest\SettingDefinition;

/**
 * Настройки сервиса на проект: один проход по значениям, запись — в SettingWriter.
 *
 * Проверка схемы (сервис зарегистрирован, ключ объявлен, значение проходит правила)
 * живёт в `PutSettingsRequest`; здесь остаётся только запись и аудит.
 */
final class PutSettingsHandler
{
    public function __construct(
        private readonly ServiceSettingsSchemaQuery $schema,
        private readonly SettingWriter $writer,
        private readonly AuditRecorder $audit,
    ) {}

    /** @return list<ProjectSetting> */
    public function handle(PutSettingsCommand $command): array
    {
        $definitions = $this->schema->handle($command->service);
        $saved = [];

        foreach ($command->data->values as $key => $value) {
            $definition = $definitions?->get((string) $key);

            // Ключ вне схемы через HTTP не проходит; здесь — страховка от прямого вызова
            if (! $definition instanceof SettingDefinition) {
                continue;
            }

            $saved[] = $this->writer->write(
                $command->project->id,
                $command->service,
                (string) $key,
                $value,
                $definition->secret,
            );
        }

        $this->audit->record(AuditAction::SettingsUpdated, $command->project->id, "service:{$command->service}", [
            'keys' => array_keys($command->data->values), // значения в аудит не пишем — среди них секреты
        ]);

        return $saved;
    }
}
