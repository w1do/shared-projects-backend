<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\LicenseFactory;
use Cms\Licensing\Domain\Contracts\LicenseSigner;
use Cms\Licensing\Domain\Enums\LicenseStatus;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Лицензионный ключ организации: активационный ключ `LIC-…`, подписанный
 * Ed25519 payload (лицензионный файл) и факты жизненного цикла —
 * статус вычисляется, а не хранится (Д3/Д5).
 *
 * @property string $id
 * @property string $project_id
 * @property int $organization_id
 * @property int $plan_id
 * @property string $key
 * @property string $signed_payload
 * @property Carbon $issued_at
 * @property Carbon $expires_at
 * @property ?Carbon $revoked_at
 * @property-read ?Organization $organization
 * @property-read ?Plan $plan
 */
class License extends Model
{
    use BelongsToProject;
    use HasFactory;
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'project_id', 'organization_id', 'plan_id', 'key',
        'signed_payload', 'issued_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'expires_at' => 'datetime',
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

    /** Вычисленный статус: revoked_at приоритетнее истечения (Д5). */
    public function status(): LicenseStatus
    {
        if ($this->revoked_at !== null) {
            return LicenseStatus::Revoked;
        }

        return $this->expires_at->isPast() ? LicenseStatus::Expired : LicenseStatus::Active;
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    /**
     * Payload лицензионного файла (Д3): состав фиксируется на момент
     * выпуска/перевыпуска — последующие изменения фич плана в уже
     * подписанные лицензии не попадают.
     *
     * @return array<string, mixed>
     */
    public function composePayload(): array
    {
        $this->loadMissing(['organization', 'plan']);

        return [
            'license_id' => $this->id,
            'key' => $this->key,
            'organization' => $this->organization?->name,
            'plan' => $this->plan?->code,
            'features' => $this->plan?->effectiveFeatureCodes($this->organization_id) ?? [],
            'issued_at' => $this->issued_at->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
        ];
    }

    /**
     * Подписывает актуальный payload и кладёт конверт `{data, signature}`
     * (base64) в `signed_payload`. Сохранение — за вызывающим handler'ом;
     * `project_id` обязан быть заполнен до подписи (ключ пары — проектный).
     */
    public function sealWith(LicenseSigner $signer): void
    {
        $data = base64_encode((string) json_encode(
            $this->composePayload(),
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
        ));

        $this->signed_payload = base64_encode((string) json_encode([
            'data' => $data,
            'signature' => $signer->sign($this->project_id, $data),
        ]));
    }

    /**
     * Payload из сохранённого конверта — для ответов валидации.
     *
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        $envelope = json_decode((string) base64_decode($this->signed_payload, true), true);
        if (! is_array($envelope)) {
            return [];
        }

        $data = base64_decode((string) ($envelope['data'] ?? ''), true);

        return $data === false ? [] : (array) json_decode($data, true);
    }

    protected static function newFactory(): LicenseFactory
    {
        return LicenseFactory::new();
    }
}
