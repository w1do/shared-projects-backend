<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Auth;

use Cms\Auth\Domain\Models\Admin;
use Spatie\LaravelData\Data;

/**
 * Результат входа оператора: токен и профиль.
 *
 * Раньше handlers возвращали `array{admin, token}` — нетипизированный массив с
 * Eloquent-моделью внутри, который контроллер разбирал руками.
 */
final class AuthTokenDTO extends Data
{
    public function __construct(
        public string $token,
        public AdminProfileDTO $admin,
    ) {}

    public static function forAdmin(string $token, Admin $admin): self
    {
        return new self($token, AdminProfileDTO::fromModel($admin));
    }
}
