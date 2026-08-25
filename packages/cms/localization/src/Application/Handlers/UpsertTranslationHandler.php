<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Localization\Application\Commands\UpsertTranslationCommand;
use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\TranslationsVersion;

final class UpsertTranslationHandler
{
    public function __construct(private readonly TranslationsVersion $version) {}

    public function handle(UpsertTranslationCommand $command): Translation
    {
        $translation = $this->target($command);

        $values = $translation->values;
        $machine = $translation->machine;

        foreach ($command->data->values as $locale => $value) {
            $values[$locale] = $value;
            if ($command->manual) {
                unset($machine[$locale]); // ручная правка снимает пометку автоперевода
            }
        }

        $translation->values = $values;
        $translation->machine = $machine;
        $translation->save();

        $this->version->bump($translation->project_id);

        return $translation;
    }

    /**
     * Обновление по id: ключ берётся из найденной записи, присланный `key`
     * игнорируется — это update, а не create. Поиск идёт в скоупе проекта,
     * запись чужого проекта не находится (404).
     */
    private function target(UpsertTranslationCommand $command): Translation
    {
        if ($command->translationId !== null) {
            return Translation::query()->findOrFail($command->translationId);
        }

        return Translation::query()->firstOrNew(['key' => $command->data->key]);
    }
}
