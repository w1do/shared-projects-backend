<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Requests\Event;

use Cms\Analytics\Application\DTOs\Event\CollectEventsDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Валидируется ТОЛЬКО конверт (Safety Protocol, И16): `events` — массив 1..100.
 *
 * Поэлементных правил здесь нет намеренно: событие с недопустимым именем или
 * без обязательных полей молча отбрасывается в `RecordEventsHandler`, ответ
 * остаётся 202 (п. Б5). Единое сообщение на все ветки конверта сохраняет
 * тело 422 байт-в-байт (снимки `analytics-collect-422-*`).
 */
final class CollectEventsRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'events' => ['required', 'array', 'min:1', 'max:100'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'events.required' => 'Provide 1..100 events.',
            'events.array' => 'Provide 1..100 events.',
            'events.min' => 'Provide 1..100 events.',
            'events.max' => 'Provide 1..100 events.',
        ];
    }

    public function events(): CollectEventsDTO
    {
        return CollectEventsDTO::fromValidated($this->validated());
    }
}
