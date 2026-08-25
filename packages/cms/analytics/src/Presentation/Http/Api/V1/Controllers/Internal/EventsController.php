<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Internal;

use Cms\Analytics\Application\Commands\RecordEventsCommand;
use Cms\Analytics\Application\Handlers\RecordEventsHandler;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Service-to-service приём событий от других сервисов платформы (Analytics::push). */
final class EventsController
{
    public function __construct(private readonly RecordEventsHandler $record) {}

    #[OA\Post(path: '/internal/events', operationId: 'analytics___invoke_internal_events', tags: ['analytics'], summary: 'POST /internal/events', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(Request $request): JsonResponse
    {
        $expected = (string) config('cms.service_token');
        if ($expected === '' || ! hash_equals('Service '.$expected, (string) $request->header('Authorization', ''))) {
            return ErrorEnvelope::unauthorized('Service token required.');
        }

        $events = $request->input('events');
        if (! is_array($events) || $events === []) {
            return ErrorEnvelope::validation(['events' => ['Provide at least one event.']]);
        }

        $accepted = 0;
        foreach ($events as $event) {
            if (! isset($event['project_id'])) {
                continue;
            }
            $accepted += $this->record->handle(new RecordEventsCommand((string) $event['project_id'], [$event], (string) ($event['source'] ?? 'service')));
        }

        return ApiResponse::data(['accepted' => $accepted], 202);
    }
}
