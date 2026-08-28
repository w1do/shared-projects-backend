<?php

declare(strict_types=1);

namespace Cms\Pay\Application\DTOs\Subscription;

use Cms\Pay\Application\DTOs\Plan\PlanDTO;
use Cms\Pay\Domain\Models\Plan;
use Cms\Shared\Billing\Subscribable;
use Illuminate\Database\Eloquent\Model;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

/**
 * Полиморфный предмет подписки в ответах: тип, код и атрибуты.
 * Тарифный план pay отдаёт полную форму PlanDTO; прочие предметы
 * (лицензионный план и будущие) — общий минимум из `Subscribable`,
 * их детальные формы живут в admin-API соответствующего модуля.
 */
final class SubscriptionSubjectDTO extends Data
{
    /**
     * @param  array<string, string>|Optional  $options
     * @param  list<string>|Optional  $features
     */
    public function __construct(
        public string $type,
        public int|string $id,
        public string $code,
        public string $name,
        public int|Optional $price_minor,
        public string|Optional $currency,
        public string|Optional $interval,
        public bool|Optional $archived,
        public array|Optional $options,
        public array|Optional $features,
    ) {}

    public static function fromSubject(Model&Subscribable $subject): self
    {
        if ($subject instanceof Plan) {
            $plan = PlanDTO::fromModel($subject->loadMissing(['options', 'features']));

            return new self(
                type: $subject->getMorphClass(),
                id: $plan->id,
                code: $plan->code,
                name: $plan->name,
                price_minor: $plan->price_minor,
                currency: $plan->currency,
                interval: $plan->interval,
                archived: $plan->archived,
                options: $plan->options,
                features: $plan->features,
            );
        }

        return new self(
            type: $subject->getMorphClass(),
            id: $subject->getKey(),
            code: $subject->subscriptionCode(),
            name: $subject->subscriptionName(),
            price_minor: Optional::create(),
            currency: Optional::create(),
            interval: Optional::create(),
            archived: Optional::create(),
            options: Optional::create(),
            features: Optional::create(),
        );
    }
}
