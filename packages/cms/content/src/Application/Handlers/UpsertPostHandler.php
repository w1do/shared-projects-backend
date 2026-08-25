<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\SnapshotRevisionCommand;
use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Domain\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

final class UpsertPostHandler
{
    public function __construct(private readonly SnapshotRevisionHandler $revision) {}

    public function handle(UpsertPostCommand $command): Post
    {
        return DB::transaction(function () use ($command) {
            $post = $command->post ?? new Post;

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

            $slugTaken = Post::query()
                ->where('slug', $post->slug)
                ->where('locale', $post->locale)
                ->when($post->exists, fn ($q) => $q->whereKeyNot($post->getKey()))
                ->exists();
            if ($slugTaken) {
                throw ValidationException::withMessages(['slug' => ['Slug is already in use.']]);
            }

            $post->save();

            if (! $command->data->categories instanceof Optional) {
                $post->categories()->sync($command->data->categories);
            }

            // Каждое сохранение — ревизия
            $this->revision->handle(new SnapshotRevisionCommand($post, $command->authorId));

            return $post->fresh(['categories']) ?? $post;
        });
    }
}
