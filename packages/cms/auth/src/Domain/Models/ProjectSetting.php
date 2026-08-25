<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

/**
 * @property string $project_id
 * @property string $service
 * @property string $key
 * @property ?string $value
 * @property bool $secret
 */
class ProjectSetting extends Model
{
    protected $fillable = ['project_id', 'service', 'key', 'value', 'secret'];

    protected function casts(): array
    {
        return ['secret' => 'bool'];
    }

    public function setPlainValue(mixed $value): void
    {
        $json = json_encode($value, JSON_UNESCAPED_UNICODE) ?: 'null';
        $this->value = $this->secret ? Crypt::encryptString($json) : $json;
    }

    public function plainValue(): mixed
    {
        if ($this->value === null) {
            return null;
        }
        $json = $this->secret ? Crypt::decryptString($this->value) : $this->value;

        return json_decode($json, true);
    }

    /** Значение для ответа API: секреты маскируются, в открытом виде не возвращаются. */
    public function displayValue(): mixed
    {
        return $this->secret ? '••••••' : $this->plainValue();
    }
}
