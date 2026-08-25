<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Status;

use Cms\Content\Application\DTOs\Status\ChangeStatusDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Правила перенесены из `ChangeStatusDTO::rules()` дословно (снимки
 * `posts-status-422`, `posts-status-422-missing-schedule`, `pages-status-422`).
 * Допустимость самого перехода — доменный инвариант статус-машины, он остаётся
 * в `ChangeStatusHandler` и отвечает 422 тем же телом (задача 5.8).
 */
final class ChangeStatusRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:draft,scheduled,published,archived'],
            'scheduled_at' => ['required_if:status,scheduled', 'nullable', 'date', 'after:now'],
        ];
    }

    public function change(): ChangeStatusDTO
    {
        return ChangeStatusDTO::from($this->validated());
    }
}
