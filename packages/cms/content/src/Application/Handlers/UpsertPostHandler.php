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
            if (! $command->data->body instanceof Optional) {
                $post->body = $command->data->body;
            }
            if (! $command->data->locale instanceof Optional) {
                $post->locale = $command->data->locale;
            }
            if (! $command->data->translation_group instanceof Optional) {
                $post->translation_group = $command->data->translation_group;
            }
            if (! $command->data->is_index instanceof Optional) {
                $post->is_index = $command->data->is_index;
            }
            $post->author_id ??= $command->authorId;

            // Уникальность слага в пределах проекта и локали — доменный инвариант
            if ($this->slugTaken->handle($post)) {
                throw ContentRuleViolation::slugTaken();
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

            return $post->fresh(['categories', 'tags']) ?? $post;
        });
    }
}
