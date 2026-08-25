<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Localization\Application\Commands\TranslateSubjectsCommand;
use Cms\Localization\Domain\Contracts\TranslatableSubjectRepository;
use Cms\Localization\Infrastructure\Persistence\TranslatableSubjectRegistry;

/**
 * Автоперевод предметов чужих пакетов (имена категорий и т. п.) — только
 * через порт: словарь не знает ни моделей, ни таблиц владельца данных.
 */
final class TranslateSubjectsHandler
{
    public function __construct(
        private readonly AiOperations $ai,
        private readonly TranslatableSubjectRegistry $registry,
    ) {}

    /** @return bool изменился ли хоть один предмет */
    public function handle(TranslateSubjectsCommand $command): bool
    {
        $changed = false;

        foreach ($this->registry->matching($command->subject) as $repository) {
            $changed = $this->translate($repository, $command) || $changed;
        }

        return $changed;
    }

    private function translate(TranslatableSubjectRepository $repository, TranslateSubjectsCommand $command): bool
    {
        $changed = false;

        foreach ($repository->all() as $subject) {
            $source = $subject->translations[$command->defaultLocale] ?? null;
            if ($source === null) {
                continue;
            }

            $missing = array_values(array_filter(
                $command->targetLocales,
                fn (string $locale) => ! isset($subject->translations[$locale]),
            ));
            if ($missing === []) {
                continue;
            }

            $result = $this->ai->translate(new TranslateRequestDTO(
                texts: ['name' => $source],
                targetLocales: $missing,
                sourceLocale: $command->defaultLocale,
                context: 'Content category name',
            ));

            $repository->applyMachineTranslations(
                $subject->id,
                $this->translatedValues($result->translations['name'], $missing),
            );

            $changed = true;
        }

        return $changed;
    }

    /**
     * @param  array<string, string>  $translated
     * @param  list<string>  $missing
     * @return array<string, string>
     */
    private function translatedValues(array $translated, array $missing): array
    {
        $values = [];
        foreach ($missing as $locale) {
            $values[$locale] = $translated[$locale];
        }

        return $values;
    }
}
