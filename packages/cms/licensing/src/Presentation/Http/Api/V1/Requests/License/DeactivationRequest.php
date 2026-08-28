<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/** Публичная деактивация установки при переезде (ТЗ 1.7). */
final class DeactivationRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:64'],
            'install_id' => ['required', 'string', 'regex:/^[0-9a-f]{64}$/'],
        ];
    }
}
