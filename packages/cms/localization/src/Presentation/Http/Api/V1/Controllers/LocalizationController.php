<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Controllers;

use Cms\Localization\Application\Queries\ListLocalizationsQuery;
use Cms\Localization\Presentation\Http\Api\V1\Requests\ListLocalizationsRequest;
use Cms\Localization\Presentation\Http\Api\V1\Resources\LocalizationResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class LocalizationController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/localizations', operationId: 'content_index_api_admin_v1_projects_project_content_localizations', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/localizations', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(ListLocalizationsRequest $request, ListLocalizationsQuery $localizations): JsonResponse
    {
        /** @var array{service?: string, locale?: string} $filters */
        $filters = $request->validated();

        return LocalizationResource::collection(
            $localizations->handle($filters['service'] ?? null, $filters['locale'] ?? null),
        )->toResponse($request);
    }
}
