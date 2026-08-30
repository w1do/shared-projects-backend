<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\Payment\PaymentFilterDTO;
use Cms\Pay\Domain\Models\Payment;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListPaymentsQuery
{
    public function handle(?PaymentFilterDTO $filter = null): CursorPaginator
    {
        $filter ??= new PaymentFilterDTO;

        return Payment::query()
            ->when($filter->status, fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate($filter->per_page);
    }
}
