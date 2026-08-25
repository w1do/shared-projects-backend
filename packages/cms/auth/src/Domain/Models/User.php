<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Cms\Auth\Database\Factories\UserFactory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * Конечный пользователь сайта проекта (guard web). Хранится строго с project_id.
 *
 * @property int $id
 * @property string $project_id
 * @property ?string $name
 * @property string $email
 * @property string $password
 * @property ?Carbon $blocked_at
 */
class User extends Authenticatable
{
    use BelongsToProject;
    use HasApiTokens;
    use HasFactory;

    protected $fillable = ['project_id', 'name', 'email', 'password'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'blocked_at' => 'datetime'];
    }

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }

    public function subjectKey(): string
    {
        return "user:{$this->project_id}:{$this->getKey()}";
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }
}
