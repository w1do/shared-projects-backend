<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $key
 * @property string $version
 * @property array<string, mixed> $manifest
 */
class ServiceManifestRecord extends Model
{
    protected $table = 'service_manifests';

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['key', 'version', 'manifest'];

    protected function casts(): array
    {
        return ['manifest' => 'array'];
    }
}
