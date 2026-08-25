<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Requests\Report;

use Cms\Analytics\Application\DTOs\Report\ReportPeriodDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Окно отчёта для всех пяти admin-эндпоинтов analytics.
 *
 * Канонический источник периода — query-string (`from`, `to`); тело запроса
 * игнорируется целиком: и при чтении (`period()`), и при валидации
 * (`validationData()`). Историческая асимметрия «валидируем то, что не читаем»
 * устранена в change `fix-known-behavioral-defects` (Д12): невалидное тело
 * больше не даёт 422, невалидный query — даёт, как и раньше.
 */
final class ReportPeriodRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'from' => ['sometimes', 'date_format:Y-m-d'],
            'to' => ['sometimes', 'date_format:Y-m-d'],
        ];
    }

    /**
     * Валидируется только query-string — тот же источник, из которого читаются значения.
     *
     * @return array<string, mixed>
     */
    public function validationData(): array
    {
        return $this->query();
    }

    /** Границы окна — только из query-string; отсутствующие заменяются дефолтом DTO. */
    public function period(): ReportPeriodDTO
    {
        return ReportPeriodDTO::fromQuery($this->query());
    }
}
