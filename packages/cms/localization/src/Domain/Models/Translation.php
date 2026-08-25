<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

/**
 * Запись словаря переводов проекта: key → {locale: value}.
 *
 * @property int $id
 * @property string $project_id
 * @property string $key
 * @property array<string, string> $values локаль → значение
 * @property array<string, bool> $machine локаль → создано автопереводом
 */
class Translation extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'key', 'values', 'machine'];

    protected $attributes = ['values' => '{}', 'machine' => '{}'];

    protected function casts(): array
    {
        return ['values' => 'array', 'machine' => 'array'];
    }
}
