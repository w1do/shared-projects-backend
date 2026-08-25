<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Cms\Auth\Database\Factories\AdminFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * Оператор платформы (guard admin). Глобальная таблица, роли — на проект (teams).
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string $locale
 */
class Admin extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasRoles;

    /** @var string */
    protected $guard_name = 'admin';

    protected $fillable = ['name', 'email', 'password', 'locale'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function isSuperAdmin(): bool
    {
        // super-admin — глобальная роль: pivot project_id = '' (вне teams-скоупа spatie)
        return DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', static::class)
            ->where('model_has_roles.model_id', $this->getKey())
            ->where('model_has_roles.project_id', '')
            ->where('roles.name', 'super-admin')
            ->exists();
    }

    protected static function newFactory(): AdminFactory
    {
        return AdminFactory::new();
    }
}
