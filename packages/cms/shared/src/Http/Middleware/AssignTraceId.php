<?php

declare(strict_types=1);

namespace Cms\Shared\Http\Middleware;

use Closure;
use Cms\Shared\Http\TraceId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/** Принимает X-Trace-Id от gateway/соседнего сервиса или генерирует новый; проставляет его в ответ и лог-контекст. */
final class AssignTraceId
{
    public const HEADER = 'X-Trace-Id';

    public function __construct(private readonly TraceId $traceId) {}

    public function handle(Request $request, Closure $next): Response
    {
        $incoming = $request->header(self::HEADER);
        if (is_string($incoming) && $incoming !== '' && strlen($incoming) <= 64) {
            $this->traceId->set($incoming);
        }

        Log::withContext(['trace_id' => $this->traceId->current()]);

        $response = $next($request);
        $response->headers->set(self::HEADER, $this->traceId->current());

        return $response;
    }
}
