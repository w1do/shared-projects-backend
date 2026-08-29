<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Actions;

use Cms\Instructs\Application\Exceptions\InstructRuleViolation;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Shared\Tenant\ProjectContext;

/**
 * Применяемая инструкция категории: опубликованная инструкция проекта, иначе
 * предустановленная платформой. Черновик не применяется.
 */
final readonly class ResolveInstructAction
{
    public function __construct(private ProjectContext $context) {}

    public function handle(InstructCategory $category): Instruct
    {
        $projectId = $this->context->required();

        $own = Instruct::query()
            ->ownedBy($projectId)
            ->where('category', $category)
            ->where('published', true)
            ->orderByDesc('id')
            ->first();

        if ($own !== null) {
            return $own;
        }

        $system = Instruct::query()
            ->where('is_system', true)
            ->where('category', $category)
            ->orderByDesc('id')
            ->first();

        return $system ?? throw InstructRuleViolation::missingInstruct($category->value);
    }
}
