<?php

declare(strict_types=1);

namespace Database\Seeders;

use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Демо-контент проекта: 10 категорий (дерево из двух уровней) и 2 новости.
 *
 * Идемпотентен: сущности ищутся по паре `project_id` + `slug`, повторный прогон
 * ничего не дублирует. Проект берётся из `DEMO_PROJECT_ID`, иначе — из уже
 * существующего контента.
 *
 * Запуск: php artisan db:seed --class=Database\\Seeders\\DemoContentSeeder
 */
class DemoContentSeeder extends Seeder
{
    /**
     * Дерево категорий: корень => потомки => потомки потомков. Всего 11 узлов,
     * три уровня — вложенность должна быть видна в интерфейсе, а не только в API.
     */
    private const CATEGORIES = [
        'Новости' => ['Компания' => [], 'Продукт' => []],
        'Аналитика' => ['Рынок' => ['Обзоры', 'Прогнозы'], 'Исследования' => []],
        'Разработка' => ['Бэкенд' => [], 'Фронтенд' => []],
    ];

    /** Имена по локалям: ru — исходное, en — перевод. Slug остаётся из en-транслитерации ru. */
    private const NAMES_EN = [
        'Новости' => 'News', 'Компания' => 'Company', 'Продукт' => 'Product',
        'Аналитика' => 'Analytics', 'Рынок' => 'Market', 'Обзоры' => 'Reviews', 'Прогнозы' => 'Forecasts',
        'Исследования' => 'Research', 'Разработка' => 'Development', 'Бэкенд' => 'Backend', 'Фронтенд' => 'Frontend',
    ];

    public function run(): void
    {
        $projectId = $this->resolveProjectId();

        $roots = [];
        $created = 0;

        foreach (self::CATEGORIES as $rootName => $children) {
            $root = $this->upsertCategory($projectId, $rootName);
            $roots[$rootName] = $root;
            $created++;

            foreach ($children as $childName => $grandChildren) {
                $child = $this->upsertCategory($projectId, $childName, $root);
                $created++;

                foreach ($grandChildren as $grandChildName) {
                    $this->upsertCategory($projectId, $grandChildName, $child);
                    $created++;
                }
            }
        }

        $this->command->info("Категорий в проекте {$projectId}: {$created}");

        $news = $roots['Новости'];

        $published = $this->upsertPost($projectId, [
            'title' => 'Платформа перешла на единый bootstrap',
            'slug' => 'platforma-pereshla-na-edinyj-bootstrap',
            'body' => 'Состав разделов панели теперь собирается из включённых сервисов проекта и прав оператора.',
            'status' => ContentStatus::Published,
            'published_at' => now()->subDay(),
        ]);
        $published->categories()->syncWithoutDetaching([$news->id]);

        $draft = $this->upsertPost($projectId, [
            'title' => 'Черновик: планы по каталогу',
            'slug' => 'chernovik-plany-po-katalogu',
            'body' => 'Каталог товаров в платформе пока отсутствует — раздел остаётся на демо-данных вёрстки.',
            'status' => ContentStatus::Draft,
            'published_at' => null,
        ]);
        $draft->categories()->syncWithoutDetaching([$news->id]);

        $this->command->info("Новостей в проекте {$projectId}: 2 (1 опубликована, 1 черновик)");
    }

    private function upsertCategory(string $projectId, string $name, ?Category $parent = null): Category
    {
        $category = Category::query()->firstOrCreate(
            ['project_id' => $projectId, 'slug' => Str::slug($name)],
            ['name' => ['ru' => $name, 'en' => self::NAMES_EN[$name] ?? $name]],
        );

        // Идемпотентное дозаполнение: у прежних записей была только одна локаль.
        $translations = $category->getTranslations('name');
        if (! isset($translations['ru']) || ! isset($translations['en'])) {
            $category->setTranslations('name', ['ru' => $name, 'en' => self::NAMES_EN[$name] ?? $name] + $translations);
            $category->save();
        }

        // Перемещение узла — только через nested set, чтобы не рвать индексы дерева.
        if ($parent !== null && $category->parent_id !== $parent->id) {
            $category->appendToNode($parent)->save();
        }

        return $category;
    }

    /** @param array<string, mixed> $attributes */
    private function upsertPost(string $projectId, array $attributes): Post
    {
        $slug = $attributes['slug'];
        unset($attributes['slug']);

        return Post::query()->updateOrCreate(
            ['project_id' => $projectId, 'slug' => $slug],
            $attributes + ['locale' => 'ru'],
        );
    }

    /**
     * Проект для демо-данных задаётся только явно.
     *
     * Content-service не знает про таблицу проектов auth-service, а брать
     * `project_id` из уже существующего контента нельзя: `tools/smoke.sh`
     * пересоздаёт проект с новым идентификатором, и в базе контента остаются
     * записи прежних проектов. Такой запасной вариант молча засеивал демо-данные
     * в давно несуществующий проект — в панели они не показывались вовсе.
     */
    private function resolveProjectId(): string
    {
        $fromEnv = $_SERVER['DEMO_PROJECT_ID'] ?? null;

        if (! is_string($fromEnv) || $fromEnv === '') {
            throw new RuntimeException(
                'Не задан DEMO_PROJECT_ID. Запускайте сидер через `./tools/cms seed-demo` — '
                .'он берёт идентификатор текущего проекта из auth-service.',
            );
        }

        return $fromEnv;
    }
}
