<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Queries;

use Cms\Instructs\Infrastructure\Persistence\SchemaPresetCatalog;

/** Каталог пресетов схем: состав одинаков для всех проектов и не зависит от данных. */
final class ListSchemaPresetsQuery
{
    /** @return list<array<string, mixed>> */
    public function handle(): array
    {
        return SchemaPresetCatalog::all();
    }
}
