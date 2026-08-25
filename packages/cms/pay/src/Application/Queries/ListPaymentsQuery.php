<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Domain\Models\Payment;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListPaymentsQuery
{
    public function handle(int $perPage = 50): CursorPaginator
    {
        return Payment::query()->orderByDesc('created_at')->orderByDesc('id')->cursorPaginate($perPage);
    }
}
