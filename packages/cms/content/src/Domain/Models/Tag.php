<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Spatie\Tags\Tag as SpatieTag;

/**
 * Тег проекта.
 *
 * Модель пакета подменяется своей (`tags.tag_model`): поиск и создание тега
 * идут через `static::query()`, поэтому глобальный scope проекта закрывает и
 * подбор существующего тега, и создание нового. Уникальность слага держится
 * этим же подбором: `slug` — json-колонка, и уникальный индекс по ней
 * непереносим между Postgres и SQLite.
 *
 * @property string $project_id
 */
class Tag extends SpatieTag
{
    use BelongsToProject;
}
