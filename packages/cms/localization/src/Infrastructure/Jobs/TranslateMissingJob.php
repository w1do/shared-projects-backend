<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Jobs;

use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Ai\Domain\Contracts\AiOperations;
use Cms\Content\Domain\Models\Category;
use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\TranslationsVersion;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Автоперевод недостающих локалей словаря.
 *
 * Идемпотентен: переводится только недостающее, существующие значения не
 * перезаписываются; записи без пропусков провайдера не вызывают. Каждая запись
 * пишется в своей транзакции — частично применённых переводов записи не бывает.
 */
final class TranslateMissingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  list<int>|null  $ids  ограничить набор записей; null — весь словарь
     * @param  list<string>  $targetLocales  локали проекта
     */
    public function __construct(
        public readonly string $projectId,
        public readonly array $targetLocales,
        public readonly string $defaultLocale,
        public readonly ?array $ids = null,
        /** dictionary | categories | null — оба предмета */
        public readonly ?string $subject = null,
    ) {}

    public function handle(AiOperations $ai, ProjectContext $context, TranslationsVersion $version): void
    {
        $context->set($this->projectId);

        $changedAnything = false;
        if ($this->subject === null || $this->subject === 'dictionary') {
            $changedAnything = $this->translateDictionary($ai);
        }
        if ($this->subject === null || $this->subject === 'categories') {
            $changedAnything = $this->translateCategories($ai) || $changedAnything;
        }

        if ($changedAnything) {
            $version->bump($this->projectId);
        }
    }

    private function translateDictionary(AiOperations $ai): bool
    {
        $translations = Translation::query()
            ->when($this->ids !== null, fn ($q) => $q->whereKey($this->ids))
            ->get();

        // Пачки по одинаковому набору недостающих локалей: один вызов провайдера
        // на группу вместо вызова на запись.
        $batches = [];
        foreach ($translations as $translation) {
            $source = $translation->values[$this->defaultLocale] ?? null;
            if ($source === null) {
                continue; // нечего переводить — нет исходного значения
            }

            $missing = array_values(array_filter(
                $this->targetLocales,
                fn (string $locale) => ! isset($translation->values[$locale]),
            ));
            if ($missing === []) {
                continue; // всё переведено — провайдер не вызывается
            }

            $batches[implode(',', $missing)]['locales'] = $missing;
            $batches[implode(',', $missing)]['rows'][$translation->key] = $translation;
        }

        $changed = false;

        foreach ($batches as $batch) {
            /** @var array<string, Translation> $rows */
            $rows = $batch['rows'];
            /** @var list<string> $missing */
            $missing = $batch['locales'];

            $result = $ai->translate(new TranslateRequestDTO(
                texts: array_map(fn (Translation $t) => $t->values[$this->defaultLocale], $rows),
                targetLocales: $missing,
                sourceLocale: $this->defaultLocale,
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

    /** Недостающие локали имён категорий; пометка — name_machine. */
    private function translateCategories(AiOperations $ai): bool
    {
        $categories = Category::query()->get();
        $changed = false;

        foreach ($categories as $category) {
            $translationsMap = $category->getTranslations('name');
            $source = $translationsMap[$this->defaultLocale] ?? null;
            if ($source === null) {
                continue;
            }

            $missing = array_values(array_filter(
                $this->targetLocales,
                fn (string $locale) => ! isset($translationsMap[$locale]),
            ));
            if ($missing === []) {
                continue;
            }

            $result = $ai->translate(new TranslateRequestDTO(
                texts: ['name' => $source],
                targetLocales: $missing,
                sourceLocale: $this->defaultLocale,
                context: 'Content category name',
            ));

            DB::transaction(function () use ($category, $result, $missing): void {
                $machine = $category->name_machine ?? [];
                foreach ($missing as $locale) {
                    $category->setTranslation('name', $locale, $result->translations['name'][$locale]);
                    $machine[$locale] = true;
                }
                $category->name_machine = $machine;
                $category->save();
            });

            $changed = true;
        }

        return $changed;
    }

    public function failed(Throwable $error): void
    {
        Log::error('translate-missing failed', ['project' => $this->projectId, 'error' => $error->getMessage()]);
    }
}
