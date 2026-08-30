<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Contracts;

use Cms\Content\Domain\ValueObjects\CityRecord;

/**
 * Порт чтения источника справочника городов: реализация отвечает за то, откуда
 * взяты данные — из поставляемой копии, из файла или по адресу.
 */
interface CityDirectorySource
{
    /** @return list<CityRecord> */
    public function read(?string $source = null): array;
}
