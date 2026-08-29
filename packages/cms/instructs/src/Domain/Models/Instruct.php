<?php

declare(strict_types=1);

namespace Cms\Instructs\Domain\Models;

use Cms\Instructs\Domain\Enums\InstructCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Инструкция генерации: правило и схема ответа, который обязана вернуть модель.
 *
 * `BelongsToProject` неприменим: у предустановленных инструкций платформы
 * `project_id` пуст, а трейт заполняет его проектом контекста. Изоляцию даёт
 * глобальный scope `InstructProjectScope`, который вешает провайдер пакета:
 * «инструкции проекта контекста плюс системные».
 *
 * @property int $id
 * @property ?string $project_id
 * @property string $title
 * @property InstructCategory $category
 * @property string $rule
 * @property array<string, mixed> $schema
 * @property bool $published
 * @property bool $is_system
 * @property ?string $author_id
 * @property ?Carbon $created_at
 * @property ?Carbon $updated_at
 */
class Instruct extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id', 'title', 'category', 'rule', 'schema', 'published', 'is_system', 'author_id',
    ];

    protected $attributes = ['published' => false, 'is_system' => false];

    protected function casts(): array
    {
        return [
            'category' => InstructCategory::class,
            'schema' => 'array',
            'published' => 'bool',
            'is_system' => 'bool',
        ];
    }

    /** @return HasMany<InstructUsage, $this> */
    public function usages(): HasMany
    {
        return $this->hasMany(InstructUsage::class);
    }

    /**
     * Собственные инструкции проекта: системные сюда не попадают — их правит
     * только платформа.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOwnedBy(Builder $query, string $projectId): Builder
    {
        return $query->where('project_id', $projectId)->where('is_system', false);
    }

    public function isSystem(): bool
    {
        return $this->is_system;
    }
}
