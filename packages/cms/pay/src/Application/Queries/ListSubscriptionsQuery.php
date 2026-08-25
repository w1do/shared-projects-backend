<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Domain\Models\Subscription;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListSubscriptions
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return Subscription::query()->with('plan')->orderByDesc('created_at')->cursorPaginate($perPage);
    }
}
