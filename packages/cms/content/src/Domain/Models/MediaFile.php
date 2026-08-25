<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Models;

use Cms\Shared\Tenant\BelongsToProject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $project_id
 * @property string $disk
 * @property string $path
 * @property string $mime
 * @property int $size
 * @property ?string $alt
 * @property ?array<string, string> $variants
 */
class MediaFile extends Model
{
    use BelongsToProject;

    protected $fillable = ['project_id', 'disk', 'path', 'mime', 'size', 'alt', 'variants'];

    protected function casts(): array
    {
        return ['variants' => 'array', 'size' => 'int'];
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
