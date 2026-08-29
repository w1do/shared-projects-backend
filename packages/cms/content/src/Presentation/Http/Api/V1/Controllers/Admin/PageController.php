<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\ChangeStatusCommand;
use Cms\Content\Application\Commands\RestoreRevisionCommand;
use Cms\Content\Application\Commands\UpsertPageCommand;
use Cms\Content\Application\DTOs\Page\PageDTO;
use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Application\Handlers\RestoreRevisionHandler;
use Cms\Content\Application\Handlers\UpsertPageHandler;
use Cms\Content\Application\Queries\ListPagesQuery;
use Cms\Content\Application\Queries\ListRevisionsQuery;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Presentation\Http\Api\V1\Requests\Page\UpsertPageRequest;
use Cms\Content\Presentation\Http\Api\V1\Requests\Status\ChangeStatusRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Page\PageResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\Revision\RevisionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class PageController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/pages', operationId: 'content_index_api_admin_v1_projects_project_content_pages', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/pages', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListPagesQuery $query): JsonResponse
    {
        return PageResource::collection($query->handle())->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/pages',
        operationId: 'content_store_api_admin_v1_projects_project_content_pages',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/pages',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['title'],
            properties: [
                new OA\Property(property: 'title', type: 'string', maxLength: 255),
                new OA\Property(property: 'slug', type: 'string', maxLength: 255),
                new OA\Property(property: 'body', type: 'string', nullable: true),
                new OA\Property(property: 'locale', type: 'string', maxLength: 10),
                new OA\Property(property: 'is_index', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertPageRequest $request, UpsertPageHandler $command): JsonResponse
    {
        $page = $command->handle(new UpsertPageCommand($request->upsert()));

        return (new PageResource(PageDTO::fromModel($page)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/pages/{page}',
        operationId: 'content_update_api_admin_v1_projects_project_content_pages_page',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/pages/{page}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['title'],
            properties: [
                new OA\Property(property: 'title', type: 'string', maxLength: 255),
                new OA\Property(property: 'slug', type: 'string', maxLength: 255),
                new OA\Property(property: 'body', type: 'string', nullable: true),
                new OA\Property(property: 'locale', type: 'string', maxLength: 10),
                new OA\Property(property: 'is_index', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertPageRequest $request, string $project, int $pageId, UpsertPageHandler $command): JsonResponse
    {
        $page = Page::query()->findOrFail($pageId);
        $updated = $command->handle(new UpsertPageCommand($request->upsert(), $page));

        return (new PageResource(PageDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/pages/{page}/status',
        operationId: 'content_changeStatus_api_admin_v1_projects_project_content_pages_page_status',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/pages/{page}/status',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['status'],
            properties: [
                new OA\Property(property: 'status', type: 'string', enum: ['draft', 'scheduled', 'published', 'archived']),
                new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time', nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function changeStatus(ChangeStatusRequest $request, string $project, int $pageId, ChangeStatusHandler $command): JsonResponse
    {
        $page = Page::query()->findOrFail($pageId);
        $updated = $command->handle(new ChangeStatusCommand($page, $request->change()));

        return (new PageResource(PageDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/pages/{page}/revisions', operationId: 'content_revisions_api_admin_v1_projects_project_content_pages_page_revisions', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/pages/{page}/revisions', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'page', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revisions(Request $request, string $project, int $pageId, ListRevisionsQuery $query): JsonResponse
    {
        $page = Page::query()->findOrFail($pageId);

        return RevisionResource::collection($query->handle($page))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/pages/{page}/revisions/{revision}/restore',
        operationId: 'content_restore_api_admin_v1_projects_project_content_pages_page_revisions_revision_restore',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/pages/{page}/revisions/{revision}/restore',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'revision', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function restore(Request $request, string $project, int $pageId, int $revisionId, RestoreRevisionHandler $command): JsonResponse
    {
        $page = Page::query()->findOrFail($pageId);
        // Ревизия ищется в пределах страницы: чужая ревизия даёт 404, а не 403 (И11)
        $revision = $page->revisions()->whereKey($revisionId)->firstOrFail();

        $restored = $command->handle(new RestoreRevisionCommand($page, $revision));

        return (new PageResource(PageDTO::fromModel($restored)))->toResponse($request);
    }
}
