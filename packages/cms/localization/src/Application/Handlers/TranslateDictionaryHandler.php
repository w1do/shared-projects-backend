<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Localization\Application\Commands\TranslateDictionaryCommand;
use Cms\Localization\Domain\Models\Translation;
use Illuminate\Support\Facades\DB;

/**
 * Автоперевод недостающих локалей словаря.
 *
 * Идемпотентен: переводится только недостающее, существующие значения не
 * перезаписываются; записи без пропусков провайдера не вызывают. Каждая запись
 * пишется в своей транзакции — частично применённых переводов записи не бывает.
 */
final class TranslateDictionaryHandler
{
    public function __construct(private readonly AiOperations $ai) {}

    /** @return bool изменилась ли хоть одна запись */
    public function handle(TranslateDictionaryCommand $command): bool
    {
        $changed = false;

        foreach ($this->batches($command) as $batch) {
            /** @var array<string, Translation> $rows */
            $rows = $batch['rows'];
            /** @var list<string> $missing */
            $missing = $batch['locales'];

            $result = $this->ai->translate(new TranslateRequestDTO(
                texts: array_map(fn (Translation $t) => $t->values[$command->defaultLocale], $rows),
                targetLocales: $missing,
                sourceLocale: $command->defaultLocale,
                context: 'Admin panel and project UI strings',
            ));

            foreach ($rows as $key => $translation) {
                // Транзакция на запись: частично применённых переводов записи не бывает.
                DB::transaction(function () use ($translation, $result, $missing, $key): void {
                    $values = $translation->values;
                    $machine = $translation->machine;
                    foreach ($missing as $locale) {
                        $values[$locale] = $result->translations[$key][$locale];
                        $machine[$locale] = true;
                    }
                    $translation->values = $values;
                    $translation->machine = $machine;
                    $translation->save();
                });
            }

            $changed = true;
        }

        return $changed;
    }

    /**
     * Пачки по одинаковому набору недостающих локалей: один вызов провайдера
     * на группу вместо вызова на запись.
     *
     * @return array<string, array{locales: list<string>, rows: array<string, Translation>}>
     */
    private function batches(TranslateDictionaryCommand $command): array
    {
        $translations = Translation::query()
            ->when($command->ids !== null, fn ($q) => $q->whereKey($command->ids))
            ->get();

        $batches = [];
        foreach ($translations as $translation) {
            $source = $translation->values[$command->defaultLocale] ?? null;
            if ($source === null) {
                continue; // нечего переводить — нет исходного значения
            }

            $missing = array_values(array_filter(
                $command->targetLocales,
                fn (string $locale) => ! isset($translation->values[$locale]),
            ));
            if ($missing === []) {
                continue; // всё переведено — провайдер не вызывается
            }

            $batches[implode(',', $missing)]['locales'] = $missing;
            $batches[implode(',', $missing)]['rows'][$translation->key] = $translation;
        }

        return $batches;
    }
}
