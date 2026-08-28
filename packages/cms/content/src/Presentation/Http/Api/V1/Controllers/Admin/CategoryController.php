<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\DeleteCategoryCommand;
use Cms\Content\Application\Commands\MoveCategoryCommand;
use Cms\Content\Application\Commands\UpsertCategoryCommand;
use Cms\Content\Application\DTOs\Category\CategoryDTO;
use Cms\Content\Application\Handlers\DeleteCategoryHandler;
use Cms\Content\Application\Handlers\MoveCategoryHandler;
use Cms\Content\Application\Handlers\UpsertCategoryHandler;
use Cms\Content\Application\Queries\CategoryTreeQuery;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Presentation\Http\Api\V1\Requests\Category\MoveCategoryRequest;
use Cms\Content\Presentation\Http\Api\V1\Requests\Category\UpsertCategoryRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Category\CategoryResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class CategoryController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/categories', operationId: 'content_index_api_admin_v1_projects_project_content_categories', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/categories', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, CategoryTreeQuery $query): JsonResponse
    {
        return CategoryResource::collection($query->handle())->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/categories',
        operationId: 'content_store_api_admin_v1_projects_project_content_categories',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/categories',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['name'],
            properties: [
                new OA\Property(property: 'name', oneOf: [new OA\Schema(type: 'string', maxLength: 255), new OA\Schema(type: 'object', additionalProperties: new OA\AdditionalProperties(type: 'string', maxLength: 255))]),
                new OA\Property(property: 'slug', type: 'string', maxLength: 255),
                new OA\Property(property: 'parent_id', type: 'integer', nullable: true),
                new OA\Property(property: 'is_index', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertCategoryRequest $request, UpsertCategoryHandler $command): JsonResponse
    {
        $category = $command->handle(new UpsertCategoryCommand($request->upsert()));

        return (new CategoryResource(CategoryDTO::fromModel($category)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/categories/{category}',
        operationId: 'content_update_api_admin_v1_projects_project_content_categories_category',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/categories/{category}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'category', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['name'],
            properties: [
                new OA\Property(property: 'name', oneOf: [new OA\Schema(type: 'string', maxLength: 255), new OA\Schema(type: 'object', additionalProperties: new OA\AdditionalProperties(type: 'string', maxLength: 255))]),
                new OA\Property(property: 'slug', type: 'string', maxLength: 255),
                new OA\Property(property: 'parent_id', type: 'integer', nullable: true),
                new OA\Property(property: 'is_index', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertCategoryRequest $request, string $project, int $categoryId, UpsertCategoryHandler $command): JsonResponse
    {
        $category = Category::query()->findOrFail($categoryId);
        $updated = $command->handle(new UpsertCategoryCommand($request->upsert(), $category));

        return (new CategoryResource(CategoryDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/categories/{category}/move',
        operationId: 'content_move_api_admin_v1_projects_project_content_categories_category_move',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/categories/{category}/move',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'category', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'parent_id', type: 'integer', nullable: true),
                new OA\Property(property: 'position', type: 'integer', minimum: 0),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function move(MoveCategoryRequest $request, string $project, int $categoryId, MoveCategoryHandler $command): JsonResponse
    {
        $category = Category::query()->findOrFail($categoryId);
        $moved = $command->handle(new MoveCategoryCommand($category, $request->move()));

        return (new CategoryResource(CategoryDTO::fromModel($moved)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/content/categories/{category}', operationId: 'content_destroy_api_admin_v1_projects_project_content_categories_category', tags: ['content'], summary: 'DELETE /api/admin/v1/projects/{project}/content/categories/{category}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'category', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function destroy(string $project, int $categoryId, DeleteCategoryHandler $command): JsonResponse
    {
        $command->handle(new DeleteCategoryCommand(Category::query()->findOrFail($categoryId)));

        return ApiResponse::noContent();
    }
}
