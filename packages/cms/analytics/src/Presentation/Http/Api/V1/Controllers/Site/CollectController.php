<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\Handlers\RecordEventsHandler;
use Cms\Analytics\Infrastructure\Support\BotFilter;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use OpenApi\Attributes as OA;

/** Приём событий с сайта проекта: public key, rate limit, bot filter → буфер → 202. */
final class CollectController
{
    public function __construct(
        private readonly RecordEventsHandler $record,
        private readonly ProjectContext $context,
    ) {}

    #[OA\Post(path: '/api/v1/collect', operationId: 'analytics___invoke_api_v1_collect', tags: ['analytics'], summary: 'POST /api/v1/collect', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(Request $request): JsonResponse
    {
        $projectId = $this->context->required();

        $limitKey = 'collect:'.$projectId;
        if (RateLimiter::tooManyAttempts($limitKey, (int) config('cms-analytics.collect_rate_limit', 600))) {
            return ErrorEnvelope::respond('too_many_events', 'Event rate limit exceeded.', 429);
        }
        RateLimiter::hit($limitKey, 60);

        if (BotFilter::isBot($request->userAgent())) {
            return ApiResponse::accepted(); // ботам отвечаем 202, но не пишем
        }

        $events = $request->input('events');
        if (! is_array($events) || $events === [] || count($events) > 100) {
            return ErrorEnvelope::validation(['events' => ['Provide 1..100 events.']]);
        }

        $this->record->handle(new RecordEventsCommand($projectId, $events, 'site', $request->ip(), $request->userAgent()));

        return ApiResponse::accepted();
    }
}
