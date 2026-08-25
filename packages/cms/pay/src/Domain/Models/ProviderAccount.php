<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

/**
 * Пер-проектный конфиг платёжного провайдера: `ProviderRegistry::for()`
 * передаёт расшифрованные credentials адаптеру через `configure()`.
 *
 * @property int $id
 * @property string $project_id
 * @property string $provider
 * @property ?array<string, mixed> $credentials
 * @property bool $enabled
 */
class ProviderAccount extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'provider', 'credentials', 'enabled'];

    protected function casts(): array
    {
        return ['credentials' => 'encrypted:array', 'enabled' => 'bool'];
    }
}
