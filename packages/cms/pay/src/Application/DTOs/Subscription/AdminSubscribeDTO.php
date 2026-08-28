<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Admin-оформление подписки (Д16): полиморфные подписчик и предмет,
 * опциональный провайдер первого платежа — без него берётся провайдер
 * из настроек платежей проекта.
 */
final class AdminSubscribeDTO extends Data
{
    public function __construct(
        public string $subscriber_type,
        public string $subscriber_id,
        public string $subject_type,
        public string $subject_id,
        public string|Optional $provider,
    ) {}
}
