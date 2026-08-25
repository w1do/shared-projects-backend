<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Localization\Application\Commands\TranslateMissingCommand;
use Cms\Localization\Infrastructure\Jobs\TranslateMissingJob;
use Cms\Shared\Tenant\ProjectContext;

/** Постановка автоперевода в очередь: сам перевод идёт в Job. */
final class TranslateMissingHandler
{
    public function __construct(private readonly ProjectContext $context) {}

    public function handle(TranslateMissingCommand $command): void
    {
        TranslateMissingJob::dispatch(
            $this->context->required(),
            $command->targetLocales,
            $command->defaultLocale,
            $command->ids,
            $command->subject,
        );
    }
}
