<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Task;

use Cms\Content\Application\DTOs\Task\TaskFilterDTO;
use Cms\Shared\BackgroundTasks\BackgroundTaskKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Отбор фоновых задач: вид работы и предмет, всё необязательно. */
final class ListTasksRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'kind' => ['sometimes', 'string', Rule::enum(BackgroundTaskKind::class)],
            'subject_type' => ['sometimes', 'string', 'max:32'],
            'subject_id' => ['sometimes', 'string', 'max:64'],
        ];
    }

    public function filter(): TaskFilterDTO
    {
        return TaskFilterDTO::from($this->validated());
    }
}
