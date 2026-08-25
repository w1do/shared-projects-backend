<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Полиморфное SEO: привязывается к посту, странице или категории.
 *
 * @property string $project_id
 * @property ?string $title
 * @property ?string $description
 * @property ?string $keywords
 * @property ?string $canonical
 * @property ?string $robots
 * @property ?string $og_title
 * @property ?string $og_description
 * @property ?string $og_image
 * @property ?string $twitter_card
 * @property ?array<string, mixed> $json_ld
 */
class SeoMeta extends Model
{
    use BelongsToProject;

    protected $table = 'seo_meta';

    protected $fillable = [
        'project_id', 'title', 'description', 'keywords', 'canonical', 'robots',
        'og_title', 'og_description', 'og_image', 'twitter_card', 'json_ld',
    ];

    protected function casts(): array
    {
        return ['json_ld' => 'array'];
    }

    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isNoindex(): bool
    {
        return $this->robots !== null && str_contains($this->robots, 'noindex');
    }
}
