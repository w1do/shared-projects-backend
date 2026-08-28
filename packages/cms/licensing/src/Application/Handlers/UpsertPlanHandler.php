<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Handlers;

use Cms\Licensing\Application\Commands\UpsertPlanCommand;
use Cms\Licensing\Application\Exceptions\PlanRuleViolation;
use Cms\Licensing\Domain\Models\Plan;
use Spatie\LaravelData\Optional;

final class UpsertPlanHandler
{
    public function handle(UpsertPlanCommand $command): Plan
    {
        $data = $command->data;
        $plan = $command->plan ?? new Plan;

        // code уникален в пределах проекта (глобальный скоуп BelongsToProject)
        $taken = Plan::query()
            ->where('code', $data->code)
            ->when($plan->exists, fn ($query) => $query->whereKeyNot($plan->getKey()))
            ->exists();
        if ($taken) {
            throw PlanRuleViolation::codeTaken();
        }

        $plan->code = $data->code;
        $plan->name = $data->name;

        // Цена — атомарная тройка: передача любого её поля перезаписывает все три
        // (FormRequest гарантирует «все заполнены или все пусты»); без полей цены
        // в запросе тройка не трогается (Optional-семантика И1)
        $priceTouched = ! $data->price_minor instanceof Optional
            || ! $data->currency instanceof Optional
            || ! $data->interval instanceof Optional;
        if ($priceTouched) {
            $plan->price_minor = $data->price_minor instanceof Optional ? null : $data->price_minor;
            $plan->currency = $data->currency instanceof Optional || $data->currency === null
                ? null
                : strtoupper($data->currency);
            $plan->interval = $data->interval instanceof Optional ? null : $data->interval;
        }

        $plan->save();

        return $plan->fresh(['features']) ?? $plan;
    }
}
