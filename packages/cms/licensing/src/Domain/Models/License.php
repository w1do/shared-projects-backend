<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\LicenseFactory;
use Cms\Licensing\Domain\Enums\LicenseStatus;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Perpetual-лицензия (Д2): бессрочное право на entitlements-снимок
 * (edition, features, entitled_version) с оплачиваемым окном обновлений
 * `updates_until`; ключ хранится только хэшем, статус вычисляется по
 * `revoked_at` — понятия «истёкшая лицензия» нет.
 *
 * @property string $id
 * @property string $project_id
 * @property int $organization_id
 * @property int $plan_id
 * @property string $key_hash
 * @property string $key_prefix
 * @property ?string $key_encrypted
 * @property string $edition
 * @property list<string> $features
 * @property ?string $entitled_version
 * @property Carbon $updates_until
 * @property int $max_installations
 * @property ?string $note
 * @property Carbon $issued_at
 * @property ?Carbon $revoked_at
 * @property-read ?Organization $organization
 * @property-read ?Plan $plan
 * @property-read ?int $active_installations_count
 */
class License extends Model
{
    use BelongsToProject;
    use HasFactory;
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'project_id', 'organization_id', 'plan_id', 'key_hash', 'key_prefix',
        'key_encrypted', 'edition', 'features', 'entitled_version', 'updates_until',
        'max_installations', 'note', 'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'updates_until' => 'date',
            'max_installations' => 'int',
            'issued_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /** @return BelongsTo<Plan, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    /** @return HasMany<LicenseInstallation, $this> */
    public function installations(): HasMany
    {
        return $this->hasMany(LicenseInstallation::class, 'license_id');
    }

    /**
     * Активные установки занимают слоты лимита (Д7).
     *
     * @return HasMany<LicenseInstallation, $this>
     */
    public function activeInstallations(): HasMany
    {
        return $this->installations()->whereNull('revoked_at');
    }

    /**
     * Лицензия по plaintext-ключу: резолв глобальный — у публичного
     * контракта нет проектного контекста, ключ и есть аутентификация (Д3).
     */
    public static function findByKey(string $key): ?self
    {
        return self::acrossProjects()->where('key_hash', LicenseKey::fromInput($key)->hash())->first();
    }

    public function status(): LicenseStatus
    {
        return $this->revoked_at === null ? LicenseStatus::Active : LicenseStatus::Revoked;
    }

    /** Серверная подсказка состояния для activate/refresh (ТЗ 1.2). */
    public function activationState(): string
    {
        return match (true) {
            $this->isRevoked() => 'revoked',
            $this->updatesExpired() => 'updates_expired',
            default => 'licensed',
        };
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    /** Конец окна обновлений включительно: `updates_until` — дата (Д2). */
    public function updatesWindowEnd(): Carbon
    {
        return $this->updates_until->clone()->endOfDay();
    }

    public function updatesExpired(): bool
    {
        return $this->updatesWindowEnd()->isPast();
    }

    /**
     * Эффективное право на версии (Д5): максимум из сохранённой
     * `entitled_version` и последнего релиза проекта внутри окна обновлений.
     */
    public function effectiveEntitledVersion(): ?string
    {
        $catalog = Release::latestVersionFor($this->project_id, $this->updatesWindowEnd());

        return match (true) {
            $catalog === null => $this->entitled_version,
            $this->entitled_version === null => $catalog,
            version_compare($catalog, $this->entitled_version, '>') => $catalog,
            default => $this->entitled_version,
        };
    }

    /**
     * Поднимает сохранённую `entitled_version` до эффективной и возвращает её;
     * понижение невозможно — право на купленное не отбирается (Д5).
     */
    public function raiseEntitledVersion(): ?string
    {
        $effective = $this->effectiveEntitledVersion();

        if ($effective !== null && $effective !== $this->entitled_version) {
            $this->entitled_version = $effective;
            $this->save();
        }

        return $effective;
    }

    protected static function newFactory(): LicenseFactory
    {
        return LicenseFactory::new();
    }
}
