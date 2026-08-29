<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Queries;

use Cms\Instructs\Application\DTOs\Instruct\InstructDTO;
use Cms\Instructs\Domain\Models\Instruct;

/** Список инструкций проекта и предустановленных платформы. */
final readonly class ListInstructsQuery
{
    /** @return list<InstructDTO> */
    public function handle(?string $category = null): array
    {
        $query = Instruct::query();

        if ($category !== null && $category !== '') {
            $query->where('category', $category);
        }

        return $query
            ->orderBy('is_system')
            ->orderBy('category')
            ->orderByDesc('id')
            ->get()
            ->map(static fn (Instruct $instruct): InstructDTO => InstructDTO::fromModel($instruct))
            ->all();
    }
}
