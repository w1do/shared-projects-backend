<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Models;

use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

/**
 * Настройки внешнего провайдера на проект (Д1): credentials зашифрованы,
 * properties — свободный JSON (диагностика, last_error), метаданные
 * group/label/name — презентационные, дефолты подставляет каталог.
 * `ProviderRegistry::for()` собирает из записи `GatewayConfig` для адаптера.
 *
 * @property int $id
 * @property string $project_id
 * @property string $provider
 * @property string $group
 * @property ?string $label
 * @property ?string $name
 * @property ?array<string, mixed> $credentials
 * @property ?array<string, mixed> $properties
 * @property ?string $return_url
 * @property ?string $fail_url
 * @property ProviderStatus $status
 */
class ProviderAccount extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id', 'provider', 'group', 'label', 'name',
        'credentials', 'properties', 'return_url', 'fail_url', 'status',
    ];

    protected $attributes = ['status' => 'active'];

    protected function casts(): array
    {
        return [
            'credentials' => 'encrypted:array',
            'properties' => 'array',
            'status' => ProviderStatus::class,
        ];
    }

    public function hasCredentials(): bool
    {
        return ($this->credentials ?? []) !== [];
    }
}
