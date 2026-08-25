<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Commands;

use Cms\Localization\Application\DTOs\Translation\UpsertTranslationDTO;

/** Команда-намерение: данные для UpsertTranslationHandler. */
final readonly class UpsertTranslationCommand
{
    public function __construct(
        public UpsertTranslationDTO $data,
        /** Ручная запись снимает пометку автоперевода с изменённых локалей. */
        public bool $manual = true,
        /**
         * id обновляемой записи. Задан — это update: ключ берётся из найденной
         * записи, присланный `key` игнорируется. Не задан — upsert по ключу.
         */
        public ?int $translationId = null,
    ) {}
}
