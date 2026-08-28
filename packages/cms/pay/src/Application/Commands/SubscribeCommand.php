<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Shared\Billing\Subscribable;
use Cms\Shared\Billing\Subscriber;
use Illuminate\Database\Eloquent\Model;

/**
 * Оформление подписки: полиморфный подписчик + уже разрешённый предмет.
 * Предмет резолвят queries на границе (`FindSitePlanQuery` для сайтового
 * `plan_code`, морф-резолв в admin-оформлении) — полиморфизм не протекает
 * в сайтовый вход.
 */
final readonly class SubscribeCommand
{
    public function __construct(
        public Subscriber $subscriber,
        public Model&Subscribable $subject,
        public ?string $provider = null,
    ) {}
}
