<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Models;

use Cms\Licensing\Database\Factories\ReleaseFactory;
use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Релиз self-hosted-поставки: источник правды для пересчёта `entitled_version`
 * и проверки обновлений; образы — во внешнем GitLab Registry.
 *
 * @property int $id
 * @property string $project_id
 * @property string $version
 * @property string $train
 * @property string $repository
 * @property Carbon $released_at
 * @property bool $is_security
 * @property ?string $min_upgrade_from
 * @property ?string $changelog_url
 */
class Release extends Model
{
    use BelongsToProject;
    use HasFactory;

    protected $fillable = [
        'project_id', 'version', 'train', 'repository', 'released_at',
        'is_security', 'min_upgrade_from', 'changelog_url',
    ];

    protected function casts(): array
    {
        return [
            'released_at' => 'datetime',
            'is_security' => 'boolean',
        ];
    }

    /** Ссылка на образ в registry: репозиторий + версия-тег. */
    public function image(): string
    {
        return "{$this->repository}:{$this->version}";
    }

    /**
     * Каталог релизов проекта — явная адресация проекта: пересчёт прав
     * работает и в публичных запросах без проектного контекста (Д5).
     *
     * @return Collection<int, static>
     */
    public static function catalogFor(string $projectId): Collection
    {
        return self::acrossProjects()->where('project_id', $projectId)->get();
    }

    /**
     * Максимальная SemVer-версия релизов проекта, вышедших не позже границы;
     * без границы — последняя существующая версия проекта.
     */
    public static function latestVersionFor(string $projectId, ?\DateTimeInterface $until = null): ?string
    {
        $releases = self::catalogFor($projectId);
        if ($until !== null) {
            $releases = $releases->filter(
                fn (Release $release) => $release->released_at->lessThanOrEqualTo($until),
            );
        }

        $versions = $releases->pluck('version');

        return $versions->isEmpty()
            ? null
            : $versions->sort(fn (string $a, string $b) => version_compare($a, $b))->last();
    }

    protected static function newFactory(): ReleaseFactory
    {
        return ReleaseFactory::new();
    }
}
