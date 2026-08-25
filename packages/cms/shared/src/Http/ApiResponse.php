<?php

declare(strict_types=1);

namespace Cms\Shared\Http;

use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    public static function data(mixed $data, int $status = 200): JsonResponse
    {
        return new JsonResponse(['data' => $data], $status);
    }

    public static function created(mixed $data): JsonResponse
    {
        return self::data($data, 201);
    }

    public static function accepted(): JsonResponse
    {
        return new JsonResponse(['data' => ['accepted' => true]], 202);
    }

    public static function noContent(): JsonResponse
    {
        return new JsonResponse(null, 204);
    }

    /** Курсорная пагинация в едином формате: data + meta.next_cursor/prev_cursor. */
    public static function cursorPage(CursorPaginator $page, ?callable $map = null): JsonResponse
    {
        $items = collect($page->items());
        if ($map !== null) {
            $items = $items->map($map);
        }

        return new JsonResponse([
            'data' => $items->values(),
            'meta' => [
                'per_page' => $page->perPage(),
                'next_cursor' => $page->nextCursor()?->encode(),
                'prev_cursor' => $page->previousCursor()?->encode(),
            ],
        ]);
    }
}
