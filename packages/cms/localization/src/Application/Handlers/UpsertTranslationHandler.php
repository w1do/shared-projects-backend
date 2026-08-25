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
        $translation = Translation::query()->firstOrNew(['key' => $command->data->key]);

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
}
