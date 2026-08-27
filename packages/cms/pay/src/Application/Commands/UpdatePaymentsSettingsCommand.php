<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Commands;

use Cms\Pay\Application\DTOs\Settings\PaymentsSettingsDTO;

/** Команда-намерение: данные для UpdatePaymentsSettingsHandler. */
final readonly class UpdatePaymentsSettingsCommand
{
    public function __construct(public PaymentsSettingsDTO $data) {}
}
