<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\ValueObjects;

/**
 * Переводимый предмет чужого пакета в терминах словаря: идентификатор и
 * уже имеющиеся переводы. Модель предмета за порт не проходит.
 */
final readonly class TranslatableSubject
{
    public function __construct(
        public int|string $id,
        /** @var array<string, string> локаль → значение */
        public array $translations,
    ) {}
}
