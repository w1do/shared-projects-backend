<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\UpsertCategoryCommand;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Infrastructure\Jobs\RegenerateSitemapJob;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Contracts\Translation\Translator;
use Illuminate\Support\Str;
use Spatie\LaravelData\Optional;

final class UpsertCategoryHandler
{
    public function __construct(
        private readonly ProjectContext $context,
        private readonly Translator $translator,
    ) {}

    public function handle(UpsertCategoryCommand $command): Category
    {
        $category = $command->category ?? new Category;
        $category->project_id ??= $this->context->required();

        // Строка кладётся в локаль по умолчанию, набор — целиком; slug один,
        // генерируется из имени локали по умолчанию.
        $machine = $category->name_machine ?? [];
        if (is_array($command->data->name)) {
            $category->setTranslations('name', $command->data->name);
            foreach (array_keys($command->data->name) as $locale) {
                unset($machine[$locale]); // ручная правка снимает пометку автоперевода
            }
        } else {
            // Локаль запроса ставится middleware'ом из introspection: строка
            // попадает в локаль проекта по умолчанию, а не в жёсткий 'en'.
            // Смена локали приложения переставляет локаль этого же транслятора,
            // поэтому значение совпадает с прежним значением локали приложения.
            $locale = $this->translator->getLocale();
            $category->setTranslation('name', $locale, $command->data->name);
            unset($machine[$locale]);
        }
        $category->name_machine = $machine;
        $category->slug = $command->data->slug instanceof Optional ? ($category->slug ?? Str::slug($this->defaultName($command->data->name))) : $command->data->slug;
        if (! $command->data->is_index instanceof Optional) {
            $category->is_index = $command->data->is_index;
        }

        if (! $command->data->parent_id instanceof Optional) {
            $parent = $command->data->parent_id === null ? null : Category::query()->findOrFail($command->data->parent_id);
            $parent === null ? $category->saveAsRoot() : $category->appendToNode($parent)->save();
        } else {
            $category->save();
        }

        RegenerateSitemapJob::dispatch($this->context->required());

        return $category;
    }

    /**
     * Имя для генерации слага: строка — как есть, набор по локалям — значение
     * локали по умолчанию, иначе первое непустое. Логика переехала из
     * `UpsertCategoryDTO::defaultName()` дословно (задача 5.9): DTO — структура
     * между слоями, поведение живёт в handler.
     *
     * @param  string|array<string, string>  $name
     */
    private function defaultName(string|array $name, string $defaultLocale = 'en'): string
    {
        if (is_string($name)) {
            return $name;
        }

        return (string) ($name[$defaultLocale] ?? (reset($name) ?: ''));
    }
}
