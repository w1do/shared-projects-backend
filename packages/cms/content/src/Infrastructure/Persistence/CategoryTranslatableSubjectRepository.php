<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Persistence;

use Cms\Content\Domain\Models\Category;
use Cms\Localization\Domain\Contracts\TranslatableSubjectRepository;
use Cms\Localization\Domain\ValueObjects\TranslatableSubject;
use Illuminate\Support\Facades\DB;

/**
 * Адаптер порта автоперевода для имён категорий.
 *
 * Живёт в пакете-владельце таблицы `categories`: словарь переводов работает с
 * категориями только через порт и о модели контента не знает.
 */
final class CategoryTranslatableSubjectRepository implements TranslatableSubjectRepository
{
    public function subject(): string
    {
        return 'categories';
    }

    /** @return array<int, TranslatableSubject> */
    public function all(): array
    {
        return Category::query()
            ->get()
            ->map(fn (Category $category): TranslatableSubject => new TranslatableSubject(
                id: $category->id,
                translations: $category->getTranslations('name'),
            ))
            ->values()
            ->all();
    }

    /** @param array<string, string> $values */
    public function applyMachineTranslations(int|string $id, array $values): void
    {
        $category = Category::query()->find($id);
        if ($category === null) {
            return;
        }

        // Транзакция на предмет: частично применённых переводов имени не бывает.
        DB::transaction(function () use ($category, $values): void {
            $machine = $category->name_machine ?? [];
            foreach ($values as $locale => $value) {
                $category->setTranslation('name', $locale, $value);
                $machine[$locale] = true;
            }
            $category->name_machine = $machine;
            $category->save();
        });
    }
}
