<?php

declare(strict_types=1);

use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\Subscription;
use Cms\Pay\Domain\Policies\SubscriptionPolicy;
use Cms\Shared\Billing\Subscriber;
use Cms\Shared\Tenant\ProjectContext;

function policySubscription(Subscriber $subscriber, Plan $plan): Subscription
{
    return Subscription::create([
        'project_id' => 'proj-1',
        'subscriber_type' => $subscriber->type,
        'subscriber_id' => $subscriber->id,
        'subject_type' => $plan->getMorphClass(),
        'subject_id' => (string) $plan->id,
        'current_period_ends_at' => now()->addMonth(),
    ]);
}

beforeEach(function () {
    app(ProjectContext::class)->set('proj-1');
    $this->plan = Plan::create([
        'project_id' => 'proj-1', 'code' => 'basic', 'name' => 'Basic',
        'price_minor' => 9900, 'currency' => 'RUB', 'interval' => 'month',
    ]);
});

test('ownedBy filters by the full subscriber pair', function () {
    $mine = policySubscription(Subscriber::siteUser('7'), $this->plan);
    policySubscription(Subscriber::siteUser('8'), $this->plan);
    policySubscription(new Subscriber('organization', '7'), $this->plan);

    $policy = new SubscriptionPolicy;
    $found = $policy->ownedBy(Subscription::query(), Subscriber::siteUser('7'))->get();

    expect($found)->toHaveCount(1)
        ->and($found->first()->id)->toBe($mine->id);
});

test('owns compares subscriber pair, not just id', function () {
    $subscription = policySubscription(Subscriber::siteUser('7'), $this->plan);
    $policy = new SubscriptionPolicy;

    expect($policy->owns($subscription, Subscriber::siteUser('7')))->toBeTrue()
        ->and($policy->owns($subscription, Subscriber::siteUser('8')))->toBeFalse()
        ->and($policy->owns($subscription, new Subscriber('organization', '7')))->toBeFalse();
});

test('past_due allows self-transition so retries keep counting', function () {
    $subscription = policySubscription(Subscriber::siteUser('7'), $this->plan);
    $subscription->transitionTo(SubscriptionStatus::PastDue);

    // Д17: повторное неуспешное продление не роняет ретрай-цикл
    $subscription->transitionTo(SubscriptionStatus::PastDue);

    expect($subscription->status)->toBe(SubscriptionStatus::PastDue)
        ->and(SubscriptionStatus::PastDue->canTransitionTo(SubscriptionStatus::PastDue))->toBeTrue()
        ->and(SubscriptionStatus::Active->canTransitionTo(SubscriptionStatus::Active))->toBeFalse();
});

test('subscription subject resolves through the morph map', function () {
    $subscription = policySubscription(Subscriber::siteUser('7'), $this->plan);

    $loaded = Subscription::query()->with('subject')->findOrFail($subscription->id);

    expect($loaded->subject)->toBeInstanceOf(Plan::class)
        ->and($loaded->subject_type)->toBe('plan')
        ->and($loaded->subscriber()->subjectKey('proj-1'))->toBe('user:proj-1:7');
});
