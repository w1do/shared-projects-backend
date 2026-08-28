<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Analytics\Application\Commands\IngestEventsCommand;
use Cms\Analytics\Application\Handlers\IngestEventsHandler;
use Cms\Analytics\Presentation\Http\Api\V1\Requests\Event\IngestEventsRequest;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Event\AcceptedEventsResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * Service-to-service приём событий от других сервисов платформы (Analytics::push).
 * Сервисная аутентификация — middleware `Cms\Shared\Http\Middleware\ServiceToken`.
 */
final class EventsController
{
    public function __construct(private readonly IngestEventsHandler $ingest) {}

    #[OA\Post(
        path: '/internal/events',
        operationId: 'analytics___invoke_internal_events',
        tags: ['analytics'],
        summary: 'POST /internal/events',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['events'],
            properties: [
                new OA\Property(property: 'events', type: 'array', items: new OA\Items(type: 'object'), minItems: 1, maxItems: 100),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function __invoke(IngestEventsRequest $request): JsonResponse
    {
        $accepted = $this->ingest->handle(new IngestEventsCommand($request->events()->events));

        return (new AcceptedEventsResource($accepted))->toResponse($request)->setStatusCode(202);
    }
}
