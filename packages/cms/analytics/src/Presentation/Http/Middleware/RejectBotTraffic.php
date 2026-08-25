<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Middleware;

use Closure;
use Cms\Analytics\Domain\Contracts\BotDetector;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Ботам отвечаем тем же 202, но события в буфер не пишем. */
final class RejectBotTraffic
{
    public function __construct(private readonly BotDetector $bots) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->bots->isBot($request->userAgent())) {
            return ApiResponse::accepted();
        }

        return $next($request);
    }
}
