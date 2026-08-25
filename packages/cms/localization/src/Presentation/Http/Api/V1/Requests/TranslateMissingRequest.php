<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class TranslateMissingRequest extends FormRequest
{
    /**
     * Контракт приёма сохраняется дословно: `ids` не массив (в том числе
     * отсутствует) — это «весь словарь», а не ошибка. Приведение делается до
     * валидации, поэтому правило описывает фактическую форму данных и не
     * сужает множество принимаемых запросов (характеризационные снимки
     * translate-missing-202-ids-scalar / -ids-garbage).
     */
    protected function prepareForValidation(): void
    {
        $ids = $this->input('ids');

        $this->merge(['ids' => is_array($ids) ? array_values($ids) : null]);
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'ids' => ['nullable', 'array'],
        ];
    }
}
