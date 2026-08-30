<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Queries;

use Cms\Pay\Application\DTOs\Subscription\SubscriptionFilterDTO;
use Cms\Pay\Domain\Models\Subscription;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ListSubscriptionsQuery
{
    public function handle(?SubscriptionFilterDTO $filter = null): CursorPaginator
    {
        $filter ??= new SubscriptionFilterDTO;

        return Subscription::query()
            ->with('subject')
            ->when($filter->subject_type, fn ($query, string $type) => $query->where('subject_type', $type))
            ->orderByDesc('created_at')
            ->cursorPaginate($filter->per_page);
    }
}
