<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\PlanFactory;
use Cms\Shared\Billing\Subscribable;
use Cms\Shared\Tenant\BelongsToProject;
use Cms\Shared\Values\Money;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * План лицензионной поставки (таблица `license_plans`, отдельно от подписочных
 * планов биллинга). Цена периода опциональна: без неё план — только для
 * ручного выпуска лицензий; с ценой — предмет подписки организации
 * (морф-алиас `license_plan`, Д2/Д11).
 *
 * @property int $id
 * @property string $project_id
 * @property string $code
 * @property string $name
 * @property ?int $price_minor
 * @property ?string $currency
 * @property ?string $interval
 */
class Plan extends Model implements Subscribable
{
    use BelongsToProject;
    use HasFactory;

    protected $table = 'license_plans';

    protected $fillable = ['project_id', 'code', 'name', 'price_minor', 'currency', 'interval'];

    protected function casts(): array
    {
        return ['price_minor' => 'int'];
    }

    /** @return HasMany<PlanFeature, $this> */
    public function features(): HasMany
    {
        return $this->hasMany(PlanFeature::class, 'plan_id');
    }

    /** @return HasMany<License, $this> */
    public function licenses(): HasMany
    {
        return $this->hasMany(License::class, 'plan_id');
    }

    public function hasPrice(): bool
    {
        return $this->price_minor !== null && $this->currency !== null && $this->interval !== null;
    }

    /**
     * Эффективный набор кодов фич для организации: базовые фичи плана
     * (organization_id IS NULL) + переопределения этой организации (Д4).
     *
     * @return list<string>
     */
    public function effectiveFeatureCodes(?int $organizationId = null): array
    {
        /** @var Collection<int, PlanFeature> $features */
        $features = $this->features()
            ->where(function ($query) use ($organizationId) {
                $query->whereNull('organization_id');
                if ($organizationId !== null) {
                    $query->orWhere('organization_id', $organizationId);
                }
            })
            ->orderBy('id')
            ->get();

        return array_values(array_unique($features->pluck('code')->all()));
    }

    public function subscriptionPrice(): Money
    {
        if (! $this->hasPrice()) {
            // Текст — контракт ответа: план без цены не может быть предметом подписки
            throw ValidationException::withMessages([
                'subject' => ['License plan has no subscription price.'],
            ]);
        }

        return Money::of((int) $this->price_minor, (string) $this->currency);
    }

    public function subscriptionInterval(): \DateInterval
    {
        if (! $this->hasPrice()) {
            throw ValidationException::withMessages([
                'subject' => ['License plan has no subscription price.'],
            ]);
        }

        return match ($this->interval) {
            'day' => new \DateInterval('P1D'),
            'year' => new \DateInterval('P1Y'),
            default => new \DateInterval('P1M'),
        };
    }

    public function subscriptionCode(): string
    {
        return $this->code;
    }

    public function subscriptionName(): string
    {
        return $this->name;
    }

    protected static function newFactory(): PlanFactory
    {
        return PlanFactory::new();
    }
}
