<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Commands;

/** Команда-намерение: данные для SyncLocalizationsHandler. */
final readonly class SyncLocalizationsCommand
{
    public function __construct(
        /**
         * Проекты для синхронизации. Пустой список — все проекты,
         * известные content-service (из таблиц translations ∪ localization).
         *
         * @var list<string>
         */
        public array $projectIds = [],
    ) {}
}
