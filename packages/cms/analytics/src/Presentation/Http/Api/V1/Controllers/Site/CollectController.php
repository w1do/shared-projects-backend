<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\Handlers\RecordEventsHandler;
use Cms\Analytics\Presentation\Http\Api\V1\Requests\Event\CollectEventsRequest;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * Приём событий с сайта проекта → буфер → 202.
 *
 * Rate limit и фильтр ботов — кросс-срезовые и живут в middleware
 * (`ThrottleEventCollection`, `RejectBotTraffic`), порядок относительно
 * валидации сохранён: лимит → боты → конверт.
 */
final class CollectController
{
    public function __construct(
        private readonly RecordEventsHandler $record,
        private readonly ProjectContext $context,
    ) {}

    #[OA\Post(path: '/api/v1/collect', operationId: 'analytics___invoke_api_v1_collect', tags: ['analytics'], summary: 'POST /api/v1/collect', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(CollectEventsRequest $request): JsonResponse
    {
        $this->record->handle(new RecordEventsCommand(
            projectId: $this->context->required(),
            events: $request->events()->events,
            source: 'site',
            ip: $request->ip(),
            userAgent: $request->userAgent(),
        ));

        return ApiResponse::accepted();
    }
}
