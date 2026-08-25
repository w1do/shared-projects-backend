<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\User;

use Cms\Auth\Domain\Models\User;
use Spatie\LaravelData\Data;

/** Результат входа/регистрации пользователя сайта: токен и профиль. */
final class SiteAuthTokenDTO extends Data
{
    public function __construct(
        public string $token,
        public SiteUserDTO $user,
    ) {}

    public static function forUser(string $token, User $user): self
    {
        return new self($token, SiteUserDTO::fromModel($user));
    }
}
