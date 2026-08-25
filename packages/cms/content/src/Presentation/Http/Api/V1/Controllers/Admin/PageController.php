<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\ChangeStatusCommand;
use Cms\Content\Application\Commands\RestoreRevisionCommand;
use Cms\Content\Application\Commands\SnapshotRevisionCommand;
use Cms\Content\Application\DTOs\Content\ChangeStatusDTO;
use Cms\Content\Application\DTOs\Page\PageDTO;
use Cms\Content\Application\DTOs\Page\UpsertPageDTO;
use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Application\Handlers\RestoreRevisionHandler;
use Cms\Content\Application\Handlers\SnapshotRevisionHandler;
use Cms\Content\Application\Queries\ListRevisions;
use Cms\Content\Domain\Models\Page;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;
use Spatie\LaravelData\Optional;

final class PageController
{
    public function __construct(private readonly SnapshotRevisionHandler $snapshot) {}

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/pages', operationId: 'content_index_api_admin_v1_projects_project_content_pages', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/pages', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(): JsonResponse
    {
        return ApiResponse::data(Page::query()->with('seo')->orderByDesc('id')->get()->map(PageDTO::fromModel(...)));
    }

    public function store(UpsertPageDTO $data): JsonResponse
    {
        $page = $this->fill(new Page, $data);
        $page->save();
        $this->snapshot->handle(new SnapshotRevisionCommand($page));

        return ApiResponse::created(PageDTO::fromModel($page));
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/content/pages/{page}', operationId: 'content_update_api_admin_v1_projects_project_content_pages_page', tags: ['content'], summary: 'PUT /api/admin/v1/projects/{project}/content/pages/{page}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(UpsertPageDTO $data, string $project, int $pageId): JsonResponse
    {
        $page = Page::query()->find($pageId);
        if ($page === null) {
            return ErrorEnvelope::notFound();
        }

        $this->fill($page, $data)->save();
        $this->snapshot->handle(new SnapshotRevisionCommand($page));

        return ApiResponse::data(PageDTO::fromModel($page));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/pages/{page}/status', operationId: 'content_changeStatus_api_admin_v1_projects_project_content_pages_page_status', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/pages/{page}/status', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function changeStatus(ChangeStatusDTO $data, string $project, int $pageId, ChangeStatusHandler $command): JsonResponse
    {
        $page = Page::query()->find($pageId);
        if ($page === null) {
            return ErrorEnvelope::notFound();
        }

        $updated = $command->handle(new ChangeStatusCommand($page, $data));
        assert($updated instanceof Page);

        return ApiResponse::data(PageDTO::fromModel($updated));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/pages/{page}/revisions', operationId: 'content_revisions_api_admin_v1_projects_project_content_pages_page_revisions', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/pages/{page}/revisions', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revisions(string $project, int $pageId, ListRevisions $query): JsonResponse
    {
        $page = Page::query()->find($pageId);

        return $page === null ? ErrorEnvelope::notFound() : ApiResponse::data($query->handle($page));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/pages/{page}/revisions/{revision}/restore', operationId: 'content_restore_api_admin_v1_projects_project_content_pages_page_revisions_revision_restore', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/pages/{page}/revisions/{revision}/restore', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function restore(string $project, int $pageId, int $revisionId, RestoreRevisionHandler $command): JsonResponse
    {
        $page = Page::query()->find($pageId);
        $revision = $page?->revisions()->whereKey($revisionId)->first();
        if ($page === null || $revision === null) {
            return ErrorEnvelope::notFound();
        }

        $restored = $command->handle(new RestoreRevisionCommand($page, $revision));
        assert($restored instanceof Page);

        return ApiResponse::data(PageDTO::fromModel($restored));
    }

    private function fill(Page $page, UpsertPageDTO $data): Page
    {
        $page->title = $data->title;
        $page->slug = $data->slug instanceof Optional ? ($page->slug ?? Str::slug($data->title)) : $data->slug;
        if (! $data->body instanceof Optional) {
            $page->body = $data->body;
        }
        if (! $data->locale instanceof Optional) {
            $page->locale = $data->locale;
        }
        if (! $data->is_index instanceof Optional) {
            $page->is_index = $data->is_index;
        }

        return $page;
    }
}
