<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Settings;

use Spatie\LaravelSettings\Settings;

/**
 * Конфигурация платёжного провайдера проекта. Выбранный провайдер —
 * контракт раздела «Платежи»; фактическое переключение шлюза выполняет
 * интеграция провайдера (Platega — отдельное изменение), доменная логика
 * платежей от настройки не зависит.
 */
final class PaymentsSettings extends Settings
{
    public string $provider;

    public static function group(): string
    {
        return 'payments';
    }

    /** @return array<string, mixed> значения нового проекта */
    public static function defaults(): array
    {
        return ['provider' => 'platega'];
    }
}
