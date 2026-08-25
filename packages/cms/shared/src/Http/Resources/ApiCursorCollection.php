<?php

declare(strict_types=1);

namespace Cms\Shared\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * Курсорная коллекция платформы: воспроизводит envelope `ApiResponse::cursorPage()`
 * байт-в-байт — `{"data": [...], "meta": {"per_page", "next_cursor", "prev_cursor"}}`.
 *
 * Стандартная пагинация Laravel добавляет `links` и расширенный `meta` (`path` и др.) —
 * здесь состав `meta` сведён ровно к текущему контракту (Safety Protocol, И5).
 */
class ApiCursorCollection extends ResourceCollection
{
    /** Элементы по умолчанию отдаются как есть; наследники задают свой Resource. */
    public $collects = JsonResource::class;

    /**
     * @param  array<string, mixed>  $paginated
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public function paginationInformation(Request $request, array $paginated, array $default): array
    {
        return [
            'meta' => [
                'per_page' => $paginated['per_page'] ?? null,
                'next_cursor' => $paginated['next_cursor'] ?? null,
                'prev_cursor' => $paginated['prev_cursor'] ?? null,
            ],
        ];
    }
}
