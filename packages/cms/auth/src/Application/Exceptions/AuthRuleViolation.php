<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Exceptions;

use Illuminate\Validation\ValidationException;

/**
 * Нарушение доменного инварианта auth: неверные учётные данные, занятый email,
 * зарезервированное имя роли, неизвестный сервис, просроченный reset-токен.
 *
 * Наследник `ValidationException` по тем же причинам, что и `ContentRuleViolation`
 * (Decision 2 + Safety Protocol, гейт 2): тела 422 зафиксированы снимками и обязаны
 * остаться байт-в-байт, а маппинг в `ErrorEnvelope::validation()` в `bootstrap/app.php`
 * ловит наследников. Тексты сообщений — часть контракта, живут здесь в одном месте.
 */
final class AuthRuleViolation extends ValidationException
{
    public static function invalidCredentials(): self
    {
        return self::withMessages(['email' => ['Invalid credentials.']]);
    }

    public static function currentPasswordIncorrect(): self
    {
        return self::withMessages(['current_password' => ['Current password is incorrect.']]);
    }

    public static function resetTokenInvalid(): self
    {
        return self::withMessages(['token' => ['Reset token is invalid or expired.']]);
    }

    public static function emailAlreadyRegistered(): self
    {
        return self::withMessages(['email' => ['Email is already registered.']]);
    }

    public static function roleNameReserved(): self
    {
        return self::withMessages(['name' => ['This role name is reserved.']]);
    }

    public static function unknownService(): self
    {
        return self::withMessages(['service' => ['Unknown service.']]);
    }
}
