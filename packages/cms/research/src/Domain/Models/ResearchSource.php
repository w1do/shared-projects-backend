<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Источник исследования: страница, текст которой попал в сводку и в базу знаний.
 *
 * @property int $id
 * @property string $project_id
 * @property int $research_id
 * @property ?string $sub_query
 * @property int $position
 * @property string $url
 * @property string $url_hash
 * @property ?string $title
 * @property string $content
 * @property ?Carbon $indexed_at
 */
class ResearchSource extends Model
{
    use BelongsToProject;

    protected $fillable = [
        'project_id', 'research_id', 'sub_query', 'position', 'url', 'url_hash', 'title', 'content', 'indexed_at',
    ];

    protected function casts(): array
    {
        return ['indexed_at' => 'datetime'];
    }

    /** Хэш адреса держит уникальность источника в пределах исследования. */
    public static function hashUrl(string $url): string
    {
        return hash('sha256', $url);
    }

    /** Хэш выводится из адреса, а не задаётся вызывающим: инвариант держит модель. */
    protected static function booted(): void
    {
        static::saving(function (self $source): void {
            $source->url_hash = self::hashUrl((string) $source->url);
        });
    }

    /** @return BelongsTo<Research, $this> */
    public function research(): BelongsTo
    {
        return $this->belongsTo(Research::class);
    }
}
