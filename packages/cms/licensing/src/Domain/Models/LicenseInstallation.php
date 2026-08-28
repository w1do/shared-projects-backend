<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\LicenseInstallationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Установка поставки по лицензии (Д7): `install_id` генерируется машиной
 * клиента, деактивация и операторский отзыв — одно поле `revoked_at`.
 * Tenant-изоляция — через лицензию: собственного project_id таблица не имеет.
 *
 * @property int $id
 * @property string $license_id
 * @property string $install_id
 * @property string $domain
 * @property ?string $app_version
 * @property ?string $last_ip
 * @property ?Carbon $last_seen_at
 * @property ?Carbon $revoked_at
 * @property-read ?License $license
 */
class LicenseInstallation extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_id', 'install_id', 'domain', 'app_version',
        'last_ip', 'last_seen_at', 'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<License, $this> */
    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class, 'license_id');
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    protected static function newFactory(): LicenseInstallationFactory
    {
        return LicenseInstallationFactory::new();
    }
}
