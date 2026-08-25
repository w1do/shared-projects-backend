<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Requests\Report;

use Cms\Analytics\Application\DTOs\Report\ReportPeriodDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Окно отчёта для всех пяти admin-эндпоинтов analytics.
 *
 * ИСТОЧНИК ДАННЫХ НЕ МЕНЯЕТСЯ (Safety Protocol, И6 + п. Б1):
 * прежний inline-вызов валидации в `ReportsController::period()` применял правила
 * к ОБЪЕДИНЕНИЮ query-string и тела (`all()`), а значения читал только
 * из query-string (`query()`).
 * Отсюда асимметрия `POST /analytics/export`: дата в теле игнорируется, но при этом
 * валидируется — невалидная дата в теле даёт 422 (зафиксировано снимком
 * `analytics-export-422` и guard-тестами 0.9).
 *
 * Поэтому `validationData()` возвращает именно `all()`, а НЕ `query()`:
 * сужение источника валидации до query-string превратило бы 422 в 202 и сломало бы
 * зафиксированный контракт. Значения при этом берутся строго из `query()` —
 * см. `period()`.
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
     * Правила применяются к query-string + телу — ровно как прежний inline-вызов.
     *
     * @return array<string, mixed>
     */
    public function validationData(): array
    {
        return $this->all();
    }

    /** Границы окна — только из query-string; отсутствующие заменяются дефолтом DTO. */
    public function period(): ReportPeriodDTO
    {
        return ReportPeriodDTO::fromQuery($this->query());
    }
}
