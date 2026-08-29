<?php

declare(strict_types=1);

namespace Cms\Instructs\Presentation\Http\Api\V1\Controllers;

use Cms\Instructs\Application\Commands\DeleteInstructCommand;
use Cms\Instructs\Application\Commands\UpsertInstructCommand;
use Cms\Instructs\Application\DTOs\Instruct\InstructDTO;
use Cms\Instructs\Application\DTOs\Instruct\UpsertInstructDTO;
use Cms\Instructs\Application\Handlers\DeleteInstructHandler;
use Cms\Instructs\Application\Handlers\UpsertInstructHandler;
use Cms\Instructs\Application\Queries\GetInstructQuery;
use Cms\Instructs\Application\Queries\ListInstructsQuery;
use Cms\Instructs\Application\Queries\ListSchemaPresetsQuery;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Instructs\Presentation\Http\Api\V1\Requests\ListInstructsRequest;
use Cms\Instructs\Presentation\Http\Api\V1\Requests\UpsertInstructRequest;
use Cms\Instructs\Presentation\Http\Api\V1\Resources\InstructCategoryResource;
use Cms\Instructs\Presentation\Http\Api\V1\Resources\InstructResource;
use Cms\Instructs\Presentation\Http\Api\V1\Resources\SchemaPresetResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class InstructController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/instructs', operationId: 'content_index_api_admin_v1_projects_project_content_instructs', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/instructs', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'category', in: 'query', required: false, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(ListInstructsRequest $request, ListInstructsQuery $query): JsonResponse
    {
        $category = $request->validated('category');

        return InstructResource::collection($query->handle(is_string($category) ? $category : null))
            ->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/instructs/categories', operationId: 'content_categories_api_admin_v1_projects_project_content_instructs', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/instructs/categories', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function categories(Request $request): JsonResponse
    {
        return InstructCategoryResource::collection(InstructCategory::cases())->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/instructs/schema-presets', operationId: 'content_schemaPresets_api_admin_v1_projects_project_content_instructs_schema_presets', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/instructs/schema-presets', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function schemaPresets(Request $request, ListSchemaPresetsQuery $query): JsonResponse
    {
        return SchemaPresetResource::collection($query->handle())->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/instructs/{instruct}', operationId: 'content_show_api_admin_v1_projects_project_content_instructs_instruct', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/instructs/{instruct}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'instruct', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 404, description: 'Not found')])]
    public function show(Request $request, GetInstructQuery $query): JsonResponse
    {
        return (new InstructResource(InstructDTO::fromModel($query->handle($this->instructId($request)))))
            ->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/instructs',
        operationId: 'content_store_api_admin_v1_projects_project_content_instructs',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/instructs',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['title', 'category', 'rule', 'schema'],
            properties: [
                new OA\Property(property: 'title', type: 'string', maxLength: 120),
                new OA\Property(property: 'category', type: 'string'),
                new OA\Property(property: 'rule', type: 'string', maxLength: 20000),
                new OA\Property(property: 'schema', type: 'object'),
                new OA\Property(property: 'published', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertInstructRequest $request, UpsertInstructHandler $handler, RequestIntrospection $introspection): JsonResponse
    {
        $instruct = $handler->handle(new UpsertInstructCommand(
            UpsertInstructDTO::fromValidated($request->validated()),
            authorId: $introspection->actorId($request),
        ));

        return (new InstructResource(InstructDTO::fromModel($instruct)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/instructs/{instruct}',
        operationId: 'content_update_api_admin_v1_projects_project_content_instructs_instruct',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/instructs/{instruct}',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'instruct', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['title', 'category', 'rule', 'schema'],
            properties: [
                new OA\Property(property: 'title', type: 'string', maxLength: 120),
                new OA\Property(property: 'category', type: 'string'),
                new OA\Property(property: 'rule', type: 'string', maxLength: 20000),
                new OA\Property(property: 'schema', type: 'object'),
                new OA\Property(property: 'published', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertInstructRequest $request, UpsertInstructHandler $handler): JsonResponse
    {
        $instruct = $handler->handle(new UpsertInstructCommand(
            UpsertInstructDTO::fromValidated($request->validated()),
            instructId: $this->instructId($request),
        ));

        return (new InstructResource(InstructDTO::fromModel($instruct)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/content/instructs/{instruct}', operationId: 'content_destroy_api_admin_v1_projects_project_content_instructs_instruct', tags: ['content'], summary: 'DELETE /api/admin/v1/projects/{project}/content/instructs/{instruct}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'instruct', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(Request $request, DeleteInstructHandler $handler): JsonResponse
    {
        $handler->handle(new DeleteInstructCommand($this->instructId($request)));

        return ApiResponse::noContent();
    }

    /**
     * id из сегмента {instruct}: route-параметры подставляются позиционно,
     * поэтому читается по имени, а не аргументом экшена.
     */
    private function instructId(Request $request): int
    {
        return (int) $request->route('instruct');
    }
}
