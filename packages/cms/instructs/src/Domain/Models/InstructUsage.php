<?php

declare(strict_types=1);

namespace Cms\Instructs\Domain\Models;

use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Снимок применения инструкции: правило и схема копируются в момент генерации,
 * поэтому последующая правка или удаление инструкции не переписывают историю.
 *
 * @property int $id
 * @property string $project_id
 * @property int $instruct_id
 * @property string $title_snapshot
 * @property InstructCategory $category_snapshot
 * @property string $rule_snapshot
 * @property array<string, mixed> $schema_snapshot
 */
class InstructUsage extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id', 'instruct_id', 'generated_type', 'generated_id',
        'title_snapshot', 'category_snapshot', 'rule_snapshot', 'schema_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'category_snapshot' => InstructCategory::class,
            'schema_snapshot' => 'array',
        ];
    }

    /** @return BelongsTo<Instruct, $this> */
    public function instruct(): BelongsTo
    {
        return $this->belongsTo(Instruct::class)->withTrashed();
    }

    /** Пакет не знает, что именно сгенерировано, и не зависит от потребителей. */
    public function generated(): MorphTo
    {
        return $this->morphTo();
    }
}
