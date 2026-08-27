<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;

/**
 * Строка реестра локализаций: (service, key, locale) в скоупе проекта.
 *
 * `default_value` пишет `localize:sync` из кода; `value` — переопределение
 * админа, sync его не трогает.
 *
 * @property int $id
 * @property string $project_id
 * @property string $service
 * @property string $key
 * @property string $locale
 * @property string|null $value
 * @property string $default_value
 */
class Localization extends Model
{
    use BelongsToProject;

    protected $table = 'localization';

    protected $fillable = ['project_id', 'service', 'key', 'locale', 'value', 'default_value'];
}
