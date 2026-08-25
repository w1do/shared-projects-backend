<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\Enums;

/**
 * Справочник известных платформе типов событий — для отчётов и навигации по данным.
 *
 * ВНИМАНИЕ (Safety Protocol, И16): это НЕ ограничение приёма. Имена событий
 * собираются в рантайме (`payment.{$status}`, `content.{$kind}.published`,
 * произвольные события сайта), поэтому применять этот enum как `Rule::in`
 * на приёме событий запрещено — единственное ограничение имени задаёт
 * `Domain\ValueObjects\EventName` (регулярка `^[a-z0-9_.]+$`).
 */
enum EventType: string
{
    case PageView = 'page_view';

    case AdminLogin = 'admin.login';

    case UserRegistered = 'user.registered';

    case UserLogin = 'user.login';

    case UserBlocked = 'user.blocked';

    case UserPasswordReset = 'user.password_reset';

    case PaymentSucceeded = 'payment.succeeded';

    case PaymentRefunded = 'payment.refunded';

    case SubscriptionCreated = 'subscription.created';

    case ContentPostPublished = 'content.post.published';

    case ContentPagePublished = 'content.page.published';

    /** Событие платформы (пришло от сервиса), а не произвольное событие сайта. */
    public function isPlatformEvent(): bool
    {
        return $this !== self::PageView;
    }

    /** @return list<string> */
    public static function names(): array
    {
        return array_map(static fn (self $type): string => $type->value, self::cases());
    }
}
