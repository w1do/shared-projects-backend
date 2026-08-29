<?php

declare(strict_types=1);

namespace Cms\Instructs\Infrastructure\Persistence;

use Cms\Instructs\Domain\Models\Instruct;

/** Идемпотентная раскладка предустановленных инструкций: повтор не плодит дубликатов. */
final class SystemInstructSeeder
{
    /** @return int число разложенных инструкций */
    public function seed(): int
    {
        foreach (SystemInstructCatalog::all() as $definition) {
            Instruct::withoutGlobalScope(InstructProjectScope::class)->updateOrCreate(
                ['is_system' => true, 'category' => $definition['category']],
                [
                    'project_id' => null,
                    'title' => $definition['title'],
                    'rule' => $definition['rule'],
                    'schema' => $definition['schema'],
                    'published' => true,
                ],
            );
        }

        return count(SystemInstructCatalog::all());
    }
}
