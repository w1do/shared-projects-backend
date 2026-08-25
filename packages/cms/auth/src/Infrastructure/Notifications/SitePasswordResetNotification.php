<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Письмо с одноразовым токеном сброса пароля пользователю сайта.
 *
 * Plain-токен существует только в момент выпуска (в БД хранится sha256-хэш),
 * поэтому это уведомление — единственный канал его доставки.
 */
final class SitePasswordResetNotification extends Notification
{
    public function __construct(
        public readonly string $plainToken,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Password reset request')
            ->line('You requested a password reset for your account.')
            ->line("Your one-time reset token: {$this->plainToken}")
            ->line('If you did not request a password reset, no further action is required.');
    }
}
