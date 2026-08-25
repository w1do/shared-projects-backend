<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\ChangeStatusCommand;
use Cms\Content\Domain\Enums\ContentStatus;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Infrastructure\Jobs\PurgeContentCacheJob;
use Cms\Content\Infrastructure\Jobs\RegenerateSitemapJob;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelData\Optional;

final class ChangeStatusHandler
{
    public function handle(ChangeStatusCommand $command): Post|Page
    {
        $target = ContentStatus::from($command->data->status);

        if (! $command->model->status->canTransitionTo($target)) {
            throw ValidationException::withMessages([
                'status' => ["Transition {$command->model->status->value} → {$target->value} is not allowed."],
            ]);
        }

        $command->model->status = $target;
        if ($command->model instanceof Post) { // у страниц нет отложенной публикации
            $command->model->scheduled_at = $target === ContentStatus::Scheduled && ! $command->data->scheduled_at instanceof Optional && $command->data->scheduled_at !== null
                ? Carbon::parse($command->data->scheduled_at)
                : null;
        }
        if ($target === ContentStatus::Published) {
            $command->model->published_at = now();
        }
        $command->model->save();

        PurgeContentCacheJob::dispatch($command->model->project_id);
        RegenerateSitemapJob::dispatch($command->model->project_id);

        if ($target === ContentStatus::Published) {
            $kind = $command->model instanceof Post ? 'post' : 'page';
            $author = $command->model instanceof Post ? $command->model->author_id : null;
            Analytics::push("admin:{$author}", [
                'name' => "content.{$kind}.published",
                'props' => ['id' => $command->model->id, 'slug' => $command->model->slug],
            ], $command->model->project_id);
        }

        return $command->model;
    }
}
