<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/** Публичная проверка обновлений (ТЗ 1.7). */
final class CheckUpdatesRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:64'],
            'install_id' => ['required', 'string', 'regex:/^[0-9a-f]{64}$/'],
            'app_version' => ['required', 'string', 'regex:/^\d+\.\d+\.\d+$/'],
        ];
    }
}
