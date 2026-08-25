<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string $project_id
 * @property string $type
 * @property string $prefix
 * @property string $key_hash
 * @property list<string> $scopes
 * @property ?Carbon $last_used_at
 * @property ?Carbon $revoked_at
 * @property-read ?Project $project
 */
class ProjectApiKey extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['project_id', 'type', 'prefix', 'key_hash', 'scopes'];

    protected function casts(): array
    {
        return ['scopes' => 'array', 'last_used_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    /** @return array{model: self, plain: string} Секрет возвращается один раз — хранится только хэш. */
    public static function issue(string $projectId, string $type, array $scopes): array
    {
        $prefix = $type === 'public' ? 'pk_live_' : 'sk_live_';
        $plain = $prefix.Str::random(40);

        $model = static::create([
            'project_id' => $projectId,
            'type' => $type,
            'prefix' => substr($plain, 0, 12),
            'key_hash' => hash('sha256', $plain),
            'scopes' => $scopes,
        ]);

        return ['model' => $model, 'plain' => $plain];
    }

    public static function findByPlainKey(string $plain): ?self
    {
        return static::query()->where('key_hash', hash('sha256', $plain))->first();
    }
}
