<?php

declare(strict_types=1);

namespace Database\Seeders;

use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\MediaFile;
use Cms\Content\Domain\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Нагруженный dev-стенд, content-сервис: дерево категорий, посты в разных
 * статусах с обложками, медиа в MinIO и словарь переводов проекта.
 *
 * Проекты приходят из auth-сеялки: `LOAD_PROJECT_IDS` — все проекты сидера
 * (их данные удаляются), `LOAD_PROJECTS` — сколько первых из списка засеять.
 *
 * Запуск: ./tools/cms seed-load [N]
 */
class LoadSeeder extends Seeder
{
    private const POSTS_PER_PROJECT = 120;

    private const TRANSLATION_KEYS = 300;

    private const MEDIA_PER_PROJECT = 30;

    private const CHUNK = 2000;

    /** Сторона квадратной картинки медиа: единицы КБ после сжатия. */
    private const MEDIA_SIZE = 200;

    private const MEDIA_TONE_STEP = 16;

    /** Дерево категорий: корни × потомки × внуки. */
    private const CATEGORY_ROOTS = ['Новости', 'Аналитика', 'Разработка'];

    private const CATEGORY_CHILDREN = 4;

    private const CATEGORY_GRANDCHILDREN = 2;

    /** @var array<string, int> */
    private array $counters = [];

    public function run(): void
    {
        $this->guardProduction();

        $owned = $this->ownedProjectIds();
        $this->purge($owned);

        $images = $this->buildImages();

        $seeded = array_slice($owned, 0, $this->projectCount());

        foreach ($seeded as $projectId) {
            mt_srand(crc32($projectId));

            $media = $this->seedMedia($projectId, $images);
            $categories = $this->seedCategories($projectId);
            $this->seedPosts($projectId, $categories, $media);
            $this->seedTranslations($projectId);
        }

        $this->report($seeded !== []);
    }

    /** Сидер наполняет стенд разработчика и в production не выполняется никогда. */
    private function guardProduction(): void
    {
        if (app()->environment('production')) {
            throw new RuntimeException('LoadSeeder не выполняется в production: это dev-инструмент нагруженного стенда.');
        }
    }

    /** @return list<string> */
    private function ownedProjectIds(): array
    {
        $value = $_SERVER['LOAD_PROJECT_IDS'] ?? null;

        if (! is_string($value)) {
            throw new RuntimeException(
                'Не задан LOAD_PROJECT_IDS. Запускайте сидер через `./tools/cms seed-load` — '
                .'список проектов приходит из auth-сеялки.',
            );
        }

        return array_values(array_filter(array_map('trim', explode(',', $value))));
    }

    private function projectCount(): int
    {
        $value = $_SERVER['LOAD_PROJECTS'] ?? null;

        return is_string($value) && $value !== '' ? max(0, (int) $value) : 0;
    }

    /** @param  list<string>  $projectIds */
    private function purge(array $projectIds): void
    {
        if ($projectIds === []) {
            return;
        }

        // Посты уходят раньше медиа и категорий: их связи чистит каскад внешних ключей
        foreach (['posts', 'pages', 'revisions', 'seo_meta', 'tags', 'categories', 'media_files', 'translations'] as $table) {
            DB::table($table)->whereIn('project_id', $projectIds)->delete();
        }

        $disk = (string) config('cms-content.media_disk', 's3');

        foreach ($projectIds as $projectId) {
            Storage::disk($disk)->deleteDirectory("projects/{$projectId}/media");
        }
    }

    /**
     * Картинки генерируются один раз на прогон и переиспользуются проектами:
     * содержимое файла роли не играет, а попиксельная сборка на каждый проект
     * заняла бы больше времени, чем весь остальной посев контента.
     *
     * @return list<string>
     */
    private function buildImages(): array
    {
        return array_map(fn (int $tint): string => $this->png(self::MEDIA_SIZE, $tint), [10, 60, 110, 160, 210, 250]);
    }

    /**
     * @param  list<string>  $images
     * @return list<int> идентификаторы медиа проекта
     */
    private function seedMedia(string $projectId, array $images): array
    {
        $disk = (string) config('cms-content.media_disk', 's3');
        $ids = [];

        for ($number = 1; $number <= self::MEDIA_PER_PROJECT; $number++) {
            $bytes = $images[$number % count($images)];
            $path = "projects/{$projectId}/media/load-".Str::random(32).'.png';

            Storage::disk($disk)->put($path, $bytes);

            $media = MediaFile::create([
                'project_id' => $projectId,
                'disk' => $disk,
                'path' => $path,
                'mime' => 'image/png',
                'size' => strlen($bytes),
                'alt' => "Изображение {$number}",
            ]);

            $ids[] = $media->id;
            $this->count('медиа-файлов');
        }

        return $ids;
    }

    /** @return list<int> идентификаторы категорий проекта */
    private function seedCategories(string $projectId): array
    {
        $ids = [];

        foreach (self::CATEGORY_ROOTS as $rootIndex => $rootName) {
            $root = $this->createCategory($projectId, $rootName, "r{$rootIndex}");
            $ids[] = $root->id;

            for ($child = 1; $child <= self::CATEGORY_CHILDREN; $child++) {
                $node = $this->createCategory($projectId, "{$rootName} · раздел {$child}", "r{$rootIndex}-c{$child}");
                $node->appendToNode($root)->save();
                $ids[] = $node->id;

                for ($grand = 1; $grand <= self::CATEGORY_GRANDCHILDREN; $grand++) {
                    $leaf = $this->createCategory($projectId, "{$rootName} · раздел {$child}.{$grand}", "r{$rootIndex}-c{$child}-g{$grand}");
                    $leaf->appendToNode($node)->save();
                    $ids[] = $leaf->id;
                }
            }
        }

        return $ids;
    }

    private function createCategory(string $projectId, string $name, string $slug): Category
    {
        $category = Category::create([
            'project_id' => $projectId,
            'name' => ['ru' => $name, 'en' => Str::ascii($name)],
            'slug' => 'cat-'.$slug,
        ]);

        $this->count('категорий');

        return $category;
    }

    /**
     * @param  list<int>  $categories
     * @param  list<int>  $media
     */
    private function seedPosts(string $projectId, array $categories, array $media): void
    {
        foreach (range(1, self::POSTS_PER_PROJECT) as $number) {
            $status = $this->postStatus($number);

            $post = Post::create([
                'project_id' => $projectId,
                'title' => "Материал №{$number}",
                'slug' => "load-post-{$number}",
                'body' => $this->body($number),
                'blocks' => [['id' => (string) Str::ulid(), 'title' => '', 'markdown' => $this->body($number)]],
                'locale' => 'ru',
                'translation_group' => "load-group-{$number}",
                'status' => $status,
                'scheduled_at' => $status === ContentStatus::Scheduled ? now()->addDays(mt_rand(1, 30)) : null,
                'published_at' => in_array($status, [ContentStatus::Published, ContentStatus::Archived], true)
                    ? now()->subDays(mt_rand(1, 365))
                    : null,
                'is_featured' => $number === 1,
                'cover_media_id' => $media[$number % count($media)],
                'banner_media_id' => $media[($number + 1) % count($media)],
            ]);

            $post->categories()->attach(array_slice($categories, $number % count($categories), 2) ?: [$categories[0]]);
            $this->count('постов');

            if ($number % 4 === 0) {
                $this->createTranslatedPost($post);
            }
        }
    }

    private function createTranslatedPost(Post $post): void
    {
        Post::create([
            'project_id' => $post->project_id,
            'title' => 'Article #'.Str::afterLast($post->slug, '-'),
            'slug' => $post->slug,
            'body' => $post->body,
            'blocks' => $post->blocks,
            'locale' => 'en',
            'translation_group' => $post->translation_group,
            'status' => $post->status,
            'published_at' => $post->published_at,
            'cover_media_id' => $post->cover_media_id,
        ]);

        $this->count('постов');
    }

    private function postStatus(int $number): ContentStatus
    {
        return match ($number % 10) {
            0 => ContentStatus::Archived,
            1 => ContentStatus::Scheduled,
            2, 3 => ContentStatus::Draft,
            default => ContentStatus::Published,
        };
    }

    private function body(int $number): string
    {
        return "Текст материала №{$number}. ".str_repeat('Синтетический абзац нагруженного стенда. ', 12);
    }

    private function seedTranslations(string $projectId): void
    {
        $rows = [];

        for ($number = 1; $number <= self::TRANSLATION_KEYS; $number++) {
            $rows[] = [
                'project_id' => $projectId,
                'key' => "site.section.key_{$number}",
                'values' => json_encode(['ru' => "Строка {$number}", 'en' => "String {$number}"], JSON_UNESCAPED_UNICODE),
                'machine' => json_encode(['en' => $number % 3 === 0], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        foreach (array_chunk($rows, self::CHUNK) as $chunk) {
            DB::table('translations')->insert($chunk);
        }

        $this->count('переводов', count($rows));
    }

    /** Квадратный PNG со ступенчатым градиентом: без GD, минимальный набор чанков формата. */
    private function png(int $size, int $tint): string
    {
        $raw = '';
        $blue = $this->channel($tint);
        $reds = array_map(fn (int $x): string => $this->tone($x, $size), range(0, $size - 1));

        foreach (range(0, $size - 1) as $y) {
            $green = $this->tone($y, $size);
            $raw .= "\x00";

            foreach ($reds as $red) {
                $raw .= $red.$green.$blue;
            }
        }

        $header = pack('NN', $size, $size)."\x08\x02\x00\x00\x00";

        return "\x89PNG\r\n\x1a\n"
            .$this->pngChunk('IHDR', $header)
            .$this->pngChunk('IDAT', (string) gzcompress($raw, 6))
            .$this->pngChunk('IEND', '');
    }

    /** Ступень градиента: плавный переход раздувал бы файл до сотни килобайт. */
    private function tone(int $position, int $size): string
    {
        return $this->channel(intdiv((int) ($position * 255 / $size), self::MEDIA_TONE_STEP) * self::MEDIA_TONE_STEP);
    }

    private function channel(int $value): string
    {
        return chr(max(0, min(255, $value)));
    }

    private function pngChunk(string $type, string $data): string
    {
        return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
    }

    private function report(bool $seeded): void
    {
        foreach ($this->counters as $what => $value) {
            $this->command->info("content: {$what} — {$value}");
        }

        $output = $this->command->getOutput();

        if ($seeded && ! Schema::hasTable('cities')) {
            $output->writeln('LOAD_SKIP=content: города проекта — справочника городов ещё нет (изменение content-cities-and-regions не реализовано)');
        }

        $parts = [];

        foreach ($this->counters as $what => $value) {
            $parts[] = "{$what} {$value}";
        }

        $output->writeln('LOAD_STATS=content: '.($parts === [] ? 'ничего не создано' : implode(', ', $parts)));
    }

    private function count(string $what, int $by = 1): void
    {
        $this->counters[$what] = ($this->counters[$what] ?? 0) + $by;
    }
}
