<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Policies;

use Illuminate\Contracts\Hashing\Hasher;

/**
 * Сменить пароль можно, только предъявив текущий.
 *
 * Проверка одинакова для оператора и пользователя сайта, поэтому живёт здесь,
 * а не в двух handlers. Отсутствие `current_password` эквивалентно пустой
 * строке — она не совпадёт ни с одним хэшем; это сохранённое поведение второго
 * рубежа проверки (первый — правило `required_with` в FormRequest).
 */
final class PasswordChangePolicy
{
    public function __construct(private readonly Hasher $hasher) {}

    public function allowsChange(string $currentHash, string $providedCurrentPassword): bool
    {
        return $this->hasher->check($providedCurrentPassword, $currentHash);
    }
}
