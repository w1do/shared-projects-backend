<?php

declare(strict_types=1);

namespace Cms\Shared\Http;

use Illuminate\Http\JsonResponse;

/**
 * Единый конверт ошибок всех сервисов платформы:
 * { "error": { "code", "message", "details", "trace_id" } }
 */
final class ErrorEnvelope
{
    public static function respond(
        string $code,
        string $message,
        int $status,
        array $details = [],
        ?string $traceId = null,
    ): JsonResponse {
        return new JsonResponse([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => (object) $details,
                'trace_id' => $traceId ?? app(TraceId::class)->current(),
            ],
        ], $status);
    }

    public static function validation(array $errors, ?string $traceId = null): JsonResponse
    {
        return self::respond('validation_failed', 'The given data was invalid.', 422, $errors, $traceId);
    }

    public static function notFound(string $message = 'Not found.'): JsonResponse
    {
        return self::respond('not_found', $message, 404);
    }

    public static function unauthorized(string $message = 'Unauthenticated.'): JsonResponse
    {
        return self::respond('unauthenticated', $message, 401);
    }

    public static function forbidden(string $message = 'Forbidden.'): JsonResponse
    {
        return self::respond('forbidden', $message, 403);
    }
}
