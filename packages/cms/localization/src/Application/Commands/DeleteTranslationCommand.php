<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Commands;

/** Команда-намерение: удалить запись словаря текущего проекта по id. */
final readonly class DeleteTranslationCommand
{
    public function __construct(public int $translationId) {}
}
