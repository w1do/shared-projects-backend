<?php

declare(strict_types=1);

namespace Cms\Content\Application\Commands;

/** Включение или выключение одного города в текущем проекте. */
final readonly class SetCityEnabledCommand
{
    public function __construct(
        public int $cityId,
        public bool $enabled,
    ) {}
}
