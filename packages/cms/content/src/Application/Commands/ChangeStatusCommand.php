<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

use Cms\Content\Application\DTOs\Status\ChangeStatusDTO;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;

/**
 * Команда-намерение: данные для ChangeStatusHandler.
 *
 * Тип носителя параметризован: смена статуса поста возвращает пост, страницы —
 * страницу. Так контроллеры обходятся без `assert($updated instanceof …)`
 * над union-типом (задача 5.4).
 *
 * @template TModel of Post|Page
 */
final readonly class ChangeStatusCommand
{
    /** @param  TModel  $model */
    public function __construct(
        public Post|Page $model,
        public ChangeStatusDTO $data,
    ) {}
}
