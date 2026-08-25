<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\DeleteCategoryCommand;
use Cms\Content\Application\Commands\MoveCategoryCommand;
use Cms\Content\Application\Commands\UpsertCategoryCommand;
use Cms\Content\Application\DTOs\Category\CategoryDTO;
use Cms\Content\Application\DTOs\Category\MoveCategoryDTO;
use Cms\Content\Application\DTOs\Category\UpsertCategoryDTO;
use Cms\Content\Application\Handlers\DeleteCategoryHandler;
use Cms\Content\Application\Handlers\MoveCategoryHandler;
use Cms\Content\Application\Handlers\UpsertCategoryHandler;
use Cms\Content\Application\Queries\CategoryTree;
use Cms\Content\Domain\Models\Category;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class CategoryController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/categories', operationId: 'content_index_api_admin_v1_projects_project_content_categories', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/categories', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(CategoryTree $query): JsonResponse
    {
        return ApiResponse::data($query->handle());
    }

    public function store(UpsertCategoryDTO $data, UpsertCategoryHandler $command): JsonResponse
    {
        return ApiResponse::created(CategoryDTO::fromModel($command->handle(new UpsertCategoryCommand($data))));
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/content/categories/{category}', operationId: 'content_update_api_admin_v1_projects_project_content_categories_category', tags: ['content'], summary: 'PUT /api/admin/v1/projects/{project}/content/categories/{category}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(UpsertCategoryDTO $data, string $project, int $categoryId, UpsertCategoryHandler $command): JsonResponse
    {
        $category = Category::query()->find($categoryId);
        if ($category === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(CategoryDTO::fromModel($command->handle(new UpsertCategoryCommand($data, $category))));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/categories/{category}/move', operationId: 'content_move_api_admin_v1_projects_project_content_categories_category_move', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/categories/{category}/move', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function move(MoveCategoryDTO $data, string $project, int $categoryId, MoveCategoryHandler $command): JsonResponse
    {
        $category = Category::query()->find($categoryId);
        if ($category === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(CategoryDTO::fromModel($command->handle(new MoveCategoryCommand($category, $data))));
    }

    public function destroy(string $project, int $categoryId, DeleteCategoryHandler $command): JsonResponse
    {
        $category = Category::query()->find($categoryId);
        if ($category === null) {
            return ErrorEnvelope::notFound();
        }

        $command->handle(new DeleteCategoryCommand($category));

        return ApiResponse::noContent();
    }
}
