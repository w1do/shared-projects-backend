<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Bootstrap;

use Cms\Auth\Domain\Models\Admin;
use Spatie\LaravelData\Data;

/** Блок `user` bootstrap-манифеста. Состав и порядок полей — публичный контракт панели. */
final class BootstrapUserDTO extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public string $locale,
        public bool $is_super_admin,
    ) {}

    public static function fromModel(Admin $admin, bool $isSuperAdmin): self
    {
        return new self(
            id: $admin->id,
            name: $admin->name,
            email: $admin->email,
            locale: $admin->locale,
            is_super_admin: $isSuperAdmin,
        );
    }
}
