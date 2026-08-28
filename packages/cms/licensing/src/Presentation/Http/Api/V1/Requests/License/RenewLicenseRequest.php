<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Продление окна обновлений: формат даты — здесь, «позже текущего окна» —
 * доменный инвариант handler'а (Д5).
 */
final class RenewLicenseRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'updates_until' => ['required', 'date'],
        ];
    }
}
