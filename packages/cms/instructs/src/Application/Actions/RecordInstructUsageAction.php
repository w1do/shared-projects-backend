<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Actions;

use Cms\Instructs\Domain\Models\Instruct;
use Cms\Instructs\Domain\Models\InstructUsage;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Database\Eloquent\Model;

/**
 * Снимок применения: правило и схема копируются в момент генерации, поэтому
 * последующая правка или удаление инструкции не переписывают историю.
 */
final readonly class RecordInstructUsageAction
{
    public function __construct(private ProjectContext $context) {}

    public function handle(Instruct $instruct, ?Model $generated = null): InstructUsage
    {
        $usage = new InstructUsage([
            'project_id' => $this->context->required(),
            'instruct_id' => $instruct->getKey(),
            'title_snapshot' => $instruct->title,
            'category_snapshot' => $instruct->category,
            'rule_snapshot' => $instruct->rule,
            'schema_snapshot' => $instruct->schema,
        ]);

        if ($generated !== null) {
            $usage->generated()->associate($generated);
        }

        $usage->save();

        return $usage;
    }
}
