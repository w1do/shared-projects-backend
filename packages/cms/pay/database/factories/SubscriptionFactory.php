<?php

declare(strict_types=1);

namespace Cms\Pay\Database\Factories;

use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Shared\Billing\Subscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Subscription> */
final class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'subscriber_type' => Subscriber::SITE_USER,
            'subscriber_id' => '7',
            'subject_type' => 'plan',
            'subject_id' => Plan::factory(),
            'status' => 'active',
            'current_period_ends_at' => now()->addMonth(),
        ];
    }

    public function forSubscriber(Subscriber $subscriber): self
    {
        return $this->state([
            'subscriber_type' => $subscriber->type,
            'subscriber_id' => $subscriber->id,
        ]);
    }

    public function forSubject(string $type, string|int $id): self
    {
        return $this->state(['subject_type' => $type, 'subject_id' => (string) $id]);
    }
}
