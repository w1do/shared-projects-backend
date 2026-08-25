<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\SnapshotRevisionCommand;
use Cms\Content\Application\Commands\UpsertPageCommand;
use Cms\Content\Domain\Models\Page;
use Illuminate\Support\Str;
use Spatie\LaravelData\Optional;

final class UpsertPageHandler
{
    public function __construct(private readonly SnapshotRevisionHandler $revision) {}

    public function handle(UpsertPageCommand $command): Page
    {
        $page = $command->page ?? new Page;

        // Слияние частичного обновления перенесено из PageController::fill()
        // дословно: «ключ отсутствует» ≠ «ключ = null» (Safety Protocol, И1).
        // Отсутствующий slug у существующей страницы сохраняется, а не
        // перегенерируется из нового title — иначе публичный URL уезжает.
        $page->title = $command->data->title;
        $page->slug = $command->data->slug instanceof Optional ? ($page->slug ?? Str::slug($command->data->title)) : $command->data->slug;
        if (! $command->data->body instanceof Optional) {
            $page->body = $command->data->body;
        }
        if (! $command->data->locale instanceof Optional) {
            $page->locale = $command->data->locale;
        }
        if (! $command->data->is_index instanceof Optional) {
            $page->is_index = $command->data->is_index;
        }

        $page->save();

        // Каждое сохранение — ревизия (порядок эффектов прежний, И8)
        $this->revision->handle(new SnapshotRevisionCommand($page));

        return $page;
    }
}
