<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Handlers;

use Cms\Pay\Application\Commands\UpsertPlanCommand;
use Cms\Pay\Domain\Models\Feature;
use Cms\Pay\Domain\Models\Plan;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Optional;

final class UpsertPlanHandler
{
    public function handle(UpsertPlanCommand $command): Plan
    {
        return DB::transaction(function () use ($command) {
            $data = $command->data;
            $plan = $command->plan ?? new Plan;

            $plan->code = $data->code;
            $plan->name = $data->name;
            $plan->price_minor = max(0, $data->price_minor);
            if (! $data->currency instanceof Optional) {
                $plan->currency = $data->currency;
            }
            if (! $data->interval instanceof Optional) {
                $plan->interval = $data->interval;
            }
            $plan->save();

            if (! $data->options instanceof Optional) {
                $plan->options()->delete();
                foreach ($data->options as $key => $value) {
                    $plan->options()->create(['project_id' => $plan->project_id, 'key' => $key, 'value' => (string) $value]);
                }
            }

            if (! $data->features instanceof Optional) {
                $ids = collect($data->features)->map(fn (string $code) => Feature::query()->firstOrCreate(
                    ['project_id' => $plan->project_id, 'code' => $code],
                    ['name' => $code],
                )->id);
                $plan->features()->sync($ids);
            }

            return $plan->fresh(['options', 'features']) ?? $plan;
        });
    }
}
