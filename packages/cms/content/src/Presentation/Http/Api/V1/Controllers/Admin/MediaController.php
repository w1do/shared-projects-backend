<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\UploadMediaCommand;
use Cms\Content\Application\DTOs\Media\MediaDTO;
use Cms\Content\Application\Handlers\UploadMediaHandler;
use Cms\Content\Application\Queries\ListMediaQuery;
use Cms\Content\Presentation\Http\Api\V1\Requests\Media\UploadMediaRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Media\MediaCursorCollection;
use Cms\Content\Presentation\Http\Api\V1\Resources\Media\MediaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class MediaController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/media', operationId: 'content_index_api_admin_v1_projects_project_content_media', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/media', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListMediaQuery $query): JsonResponse
    {
        return (new MediaCursorCollection($query->handle()))->toResponse($request);
    }

    public function store(UploadMediaRequest $request, UploadMediaHandler $command): JsonResponse
    {
        $media = $command->handle(new UploadMediaCommand($request->uploadedFile(), $request->alt()));

        return (new MediaResource(MediaDTO::fromModel($media)))->toCreatedResponse($request);
    }
}
