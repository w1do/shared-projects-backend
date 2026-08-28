<?php

declare(strict_types=1);

namespace Cms\Pay\Database\Factories;

use Cms\Pay\Domain\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Payment> */
final class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'project_id' => 'proj-1',
            'subject_key' => 'user:proj-1:7',
            'amount_minor' => 9900,
            'currency' => 'RUB',
            'status' => 'created',
            'provider' => 'manual',
        ];
    }
}
