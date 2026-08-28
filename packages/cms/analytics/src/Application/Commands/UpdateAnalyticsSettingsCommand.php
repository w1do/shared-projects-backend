<?php

declare(strict_types=1);

namespace Cms\Analytics\Application\Commands;

use Cms\Analytics\Application\DTOs\Settings\AnalyticsSettingsDTO;

/** Команда-намерение: данные для UpdateAnalyticsSettingsHandler. */
final readonly class UpdateAnalyticsSettingsCommand
{
    public function __construct(public AnalyticsSettingsDTO $data) {}
}
