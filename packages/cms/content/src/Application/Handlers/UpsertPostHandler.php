<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\SnapshotRevisionCommand;
use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Application\Exceptions\ContentRuleViolation;
use Cms\Content\Application\Queries\PostSlugTakenQuery;
use Cms\Content\Domain\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\LaravelData\Optional;

final class UpsertPostHandler
{
    public function __construct(
        private readonly SnapshotRevisionHandler $revision,
        private readonly PostSlugTakenQuery $slugTaken,
    ) {}

    public function handle(UpsertPostCommand $command): Post
    {
        return DB::transaction(function () use ($command) {
            $post = $command->post ?? new Post;

            // «Ключ отсутствует» ≠ «ключ = null»: непереданное поле не трогается,
            // слаг существующего поста не перегенерируется (Safety Protocol, И1).
            $post->title = $command->data->title;
            $post->slug = $command->data->slug instanceof Optional ? ($post->slug ?? Str::slug($command->data->title)) : $command->data->slug;
            if (! $command->data->blocks instanceof Optional) {
                $post->blocks = $this->withIds($command->data->blocks);
            }
            // `body` — проекция блоков: переданное клиентом тело не применяется,
            // иначе два источника правды разъехались бы при первой же правке.
            $post->body = $this->composeBody($post->blocks ?? []);
            if (! $command->data->locale instanceof Optional) {
                $post->locale = $command->data->locale;
            }
            if (! $command->data->translation_group instanceof Optional) {
                $post->translation_group = $command->data->translation_group;
            }
            if (! $command->data->is_index instanceof Optional) {
                $post->is_index = $command->data->is_index;
            }
            if (! $command->data->is_featured instanceof Optional) {
                $post->is_featured = $command->data->is_featured;
            }
            // Непереданное поле не трогает прежнее изображение, переданный null — снимает его
            if (! $command->data->cover_media_id instanceof Optional) {
                $post->cover_media_id = $command->data->cover_media_id;
            }
            if (! $command->data->banner_media_id instanceof Optional) {
                $post->banner_media_id = $command->data->banner_media_id;
            }
            $post->author_id ??= $command->authorId;

            // Уникальность слага в пределах проекта и локали — доменный инвариант
            if ($this->slugTaken->handle($post)) {
                throw ContentRuleViolation::slugTaken();
            }

            if ($post->is_featured) {
                $this->unpinOthers($post);
            }

            $post->save();

            if (! $command->data->categories instanceof Optional) {
                $post->categories()->sync($command->data->categories);
            }

            // Теги проекта: существующий переиспользуется, новый создаётся,
            // повтор того же имени дубликата не даёт (модель тега — скоуп проекта).
            if (! $command->data->tags instanceof Optional) {
                $post->syncTags(array_values(array_unique($command->data->tags)));
            }

            // Каждое сохранение — ревизия
            $this->revision->handle(new SnapshotRevisionCommand($post, $command->authorId));

            return $post->fresh(['categories', 'tags', 'cover', 'banner']) ?? $post;
        });
    }

    /** Закреплённый пост в проекте один: прежний теряет признак в той же транзакции. */
    private function unpinOthers(Post $post): void
    {
        $others = Post::query()->where('is_featured', true);

        if ($post->exists) {
            $others->whereKeyNot($post->getKey());
        }

        $others->update(['is_featured' => false]);
    }

    /**
     * Идентификатор присваивает платформа: блок без `id` получает ULID,
     * переданный сохраняется как есть — уникальность проверена в FormRequest.
     *
     * @param  list<array<string, mixed>>  $blocks
     * @return list<array{id: string, title: string, markdown: string}>
     */
    private function withIds(array $blocks): array
    {
        $result = [];

        foreach ($blocks as $block) {
            $id = trim((string) ($block['id'] ?? ''));

            $result[] = [
                'id' => $id !== '' ? $id : (string) Str::ulid(),
                'title' => (string) ($block['title'] ?? ''),
                'markdown' => (string) ($block['markdown'] ?? ''),
            ];
        }

        return $result;
    }

    /**
     * Единый текст поста для клиентов, которые не знают о блоках:
     * название блока становится заголовком второго уровня.
     *
     * @param  list<array{id: string, title: string, markdown: string}>  $blocks
     */
    private function composeBody(array $blocks): ?string
    {
        $parts = [];

        foreach ($blocks as $block) {
            $title = trim($block['title']);

            $parts[] = $title === '' ? $block['markdown'] : "## {$title}\n\n{$block['markdown']}";
        }

        $body = trim(implode("\n\n", $parts));

        return $body === '' ? null : $body;
    }
}
