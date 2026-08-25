<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\ValueObjects;

/**
 * Общий для всего батча контекст приёма: тенант, источник и обогащение запроса.
 *
 * Тенант и источник здесь — контекст ОДНОГО вызова приёмника: батч разных
 * проектов разбивается на несколько вызовов ещё в `IngestEventsHandler` (И17).
 */
final readonly class IngestionContext
{
    public function __construct(
        public string $projectId,
        public string $source,
        public ClientProfile $client,
        public string $ipHash,
    ) {}
}
