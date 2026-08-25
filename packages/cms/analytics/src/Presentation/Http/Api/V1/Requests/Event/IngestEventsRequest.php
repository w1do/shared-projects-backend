<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Requests\Event;

use Cms\Analytics\Application\DTOs\Event\IngestEventsDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Валидируется ТОЛЬКО конверт (Safety Protocol, И16): `events` — массив 1..100.
 *
 * Поэлементных правил здесь нет и быть не должно по двум причинам:
 *  1) отбраковка отдельных событий со счётчиком `accepted` — контракт handler'а
 *     (п. Б5: событие без `project_id` или с недопустимым именем молча пропускается,
 *     `currency: null` гасится в `''`, а не даёт 422);
 *  2) любое правило вида `events.*` включает `excludeUnvalidatedArrayKeys`
 *     (`Validator::validated()`), и ключ `events` целиком выпадает из `validated()` —
 *     батч молча приехал бы в handler пустым.
 *
 * Единое сообщение на все ветки конверта сохраняет тело 422 байт-в-байт
 * (снимки `analytics-internal-events-422-*`).
 */
final class IngestEventsRequest extends FormRequest
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
            'events.required' => 'Provide at least one event.',
            'events.array' => 'Provide at least one event.',
            'events.min' => 'Provide at least one event.',
            'events.max' => 'Provide at least one event.',
        ];
    }

    public function events(): IngestEventsDTO
    {
        return IngestEventsDTO::fromValidated($this->validated());
    }
}
