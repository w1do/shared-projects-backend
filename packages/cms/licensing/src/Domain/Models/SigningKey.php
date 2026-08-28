<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

/**
 * Ed25519-пара подписи лицензий проекта (Д3): одна активная пара на проект,
 * приватный ключ хранится только шифрованным (`encrypted`-cast), публичный —
 * открыто, для встраивания в поставку.
 *
 * @property int $id
 * @property string $project_id
 * @property string $public_key
 * @property string $secret_key
 */
class SigningKey extends Model
{
    use BelongsToProject;

    protected $table = 'license_signing_keys';

    protected $fillable = ['project_id', 'public_key', 'secret_key'];

    protected $hidden = ['secret_key'];

    protected function casts(): array
    {
        return ['secret_key' => 'encrypted'];
    }
}
