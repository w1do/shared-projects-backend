<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\ValueObjects;

/**
 * Набор прав оператора в текущем проекте.
 *
 * Здесь живёт правило видимости, ради которого раньше в сборке bootstrap стоял
 * трёхчленный inline-предикат: пункт навигации виден, если он не закрыт правом,
 * если оператор — супер-админ (`['*']`), либо если право у него есть.
 *
 * `['*']` — не «право со звёздочкой», а маркер супер-админа: он приходит в ответе
 * панели ровно в таком виде и сравнивается целиком, а не поэлементно.
 */
final readonly class PermissionSet
{
    /** @param  list<string>  $permissions */
    public function __construct(public array $permissions) {}

    /** Супер-админ: панель получает `["*"]` вместо перечисления прав. */
    public static function superAdmin(): self
    {
        return new self(['*']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->permissions === ['*'];
    }

    public function allows(?string $permission): bool
    {
        return $permission === null
            || $this->isSuperAdmin()
            || in_array($permission, $this->permissions, true);
    }
}
