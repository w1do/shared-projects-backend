<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\Seo\SeoDTO;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/** Полиморфное SEO: PUT /content/seo/{type}/{id}, type ∈ post|page|category. */
final class SeoController
{
    private const TYPES = [
        'post' => Post::class,
        'page' => Page::class,
        'category' => Category::class,
    ];

    public function update(SeoDTO $data, string $project, string $type, int $id, UpsertSeoHandler $command): JsonResponse
    {
        $model = $this->resolve($type, $id);
        if ($model === null) {
            return ErrorEnvelope::notFound();
        }

        $seo = $command->handle(new UpsertSeoCommand($model, $data));

        return ApiResponse::data(SeoDTO::fromModel($seo));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/seo/{type}/{id}', operationId: 'content_show_api_admin_v1_projects_project_content_seo_type_id', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/seo/{type}/{id}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(string $project, string $type, int $id): JsonResponse
    {
        $model = $this->resolve($type, $id);
        if ($model === null) {
            return ErrorEnvelope::notFound();
        }

        $seo = $model->seo;

        return ApiResponse::data($seo === null ? null : SeoDTO::fromModel($seo));
    }

    private function resolve(string $type, int $id): Post|Page|Category|null
    {
        $class = self::TYPES[$type] ?? null;
        if ($class === null) {
            return null;
        }

        return $class::query()->find($id);
    }
}
