<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\ImportMediaCommand;
use Cms\Content\Application\Commands\UploadMediaCommand;
use Cms\Content\Application\DTOs\Media\MediaDTO;
use Cms\Content\Application\Handlers\ImportMediaHandler;
use Cms\Content\Application\Handlers\UploadMediaHandler;
use Cms\Content\Application\Queries\ListMediaQuery;
use Cms\Content\Presentation\Http\Api\V1\Requests\Media\ImportMediaRequest;
use Cms\Content\Presentation\Http\Api\V1\Requests\Media\UploadMediaRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Media\MediaCursorCollection;
use Cms\Content\Presentation\Http\Api\V1\Resources\Media\MediaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class MediaController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/media',
        operationId: 'content_index_api_admin_v1_projects_project_content_media',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/media',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(Request $request, ListMediaQuery $query): JsonResponse
    {
        return (new MediaCursorCollection($query->handle()))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/media',
        operationId: 'content_store_api_admin_v1_projects_project_content_media',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/media',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(
            required: ['file'],
            properties: [
                new OA\Property(property: 'file', type: 'string', format: 'binary'),
                new OA\Property(property: 'alt', type: 'string', maxLength: 255, nullable: true),
            ],
        ))),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UploadMediaRequest $request, UploadMediaHandler $command): JsonResponse
    {
        $media = $command->handle(new UploadMediaCommand($request->uploadedFile(), $request->alt()));

        return (new MediaResource(MediaDTO::fromModel($media)))->toCreatedResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/media/import',
        operationId: 'content_import_api_admin_v1_projects_project_content_media_import',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/media/import',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['url'],
            properties: [
                new OA\Property(property: 'url', type: 'string', format: 'uri', maxLength: 2048),
                new OA\Property(property: 'alt', type: 'string', maxLength: 255, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function import(ImportMediaRequest $request, ImportMediaHandler $command): JsonResponse
    {
        $media = $command->handle(new ImportMediaCommand($request->import()));

        return (new MediaResource(MediaDTO::fromModel($media)))->toCreatedResponse($request);
    }
}
