<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\ChangeStatusCommand;
use Cms\Content\Application\Commands\RestoreRevisionCommand;
use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Application\DTOs\Content\ChangeStatusDTO;
use Cms\Content\Application\DTOs\Post\PostDTO;
use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Application\Handlers\RestoreRevisionHandler;
use Cms\Content\Application\Handlers\UpsertPostHandler;
use Cms\Content\Application\Queries\ListPosts;
use Cms\Content\Application\Queries\ListRevisions;
use Cms\Content\Domain\Models\Post;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class PostController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/posts', operationId: 'content_index_api_admin_v1_projects_project_content_posts', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/posts', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListPosts $query): JsonResponse
    {
        $page = $query->handle(
            status: $request->query('status'),
            locale: $request->query('locale'),
            categoryId: $request->query('category') !== null ? (int) $request->query('category') : null,
        );

        return ApiResponse::cursorPage($page, fn (Post $post) => PostDTO::fromModel($post));
    }

    public function store(UpsertPostDTO $data, Request $request, UpsertPostHandler $command): JsonResponse
    {
        $post = $command->handle(new UpsertPostCommand($data, authorId: $this->actorId($request)));

        return ApiResponse::created(PostDTO::fromModel($post));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/posts/{post}', operationId: 'content_show_api_admin_v1_projects_project_content_posts_post', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/posts/{post}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(string $project, int $postId): JsonResponse
    {
        $post = Post::query()->with(['categories:id', 'seo'])->find($postId);

        return $post === null ? ErrorEnvelope::notFound() : ApiResponse::data(PostDTO::fromModel($post));
    }

    public function update(UpsertPostDTO $data, Request $request, string $project, int $postId, UpsertPostHandler $command): JsonResponse
    {
        $post = Post::query()->find($postId);
        if ($post === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(PostDTO::fromModel($command->handle(new UpsertPostCommand($data, $post, $this->actorId($request)))));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/posts/{post}/status', operationId: 'content_changeStatus_api_admin_v1_projects_project_content_posts_post_status', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/posts/{post}/status', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function changeStatus(ChangeStatusDTO $data, string $project, int $postId, ChangeStatusHandler $command): JsonResponse
    {
        $post = Post::query()->find($postId);
        if ($post === null) {
            return ErrorEnvelope::notFound();
        }

        $updated = $command->handle(new ChangeStatusCommand($post, $data));
        assert($updated instanceof Post);

        return ApiResponse::data(PostDTO::fromModel($updated));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/posts/{post}/revisions', operationId: 'content_revisions_api_admin_v1_projects_project_content_posts_post_revisions', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/posts/{post}/revisions', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revisions(string $project, int $postId, ListRevisions $query): JsonResponse
    {
        $post = Post::query()->find($postId);

        return $post === null ? ErrorEnvelope::notFound() : ApiResponse::data($query->handle($post));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/posts/{post}/revisions/{revision}/restore', operationId: 'content_restore_api_admin_v1_projects_project_content_posts_post_revisions_revision_restore', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/posts/{post}/revisions/{revision}/restore', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function restore(Request $request, string $project, int $postId, int $revisionId, RestoreRevisionHandler $command): JsonResponse
    {
        $post = Post::query()->find($postId);
        $revision = $post?->revisions()->whereKey($revisionId)->first();
        if ($post === null || $revision === null) {
            return ErrorEnvelope::notFound();
        }

        $restored = $command->handle(new RestoreRevisionCommand($post, $revision, $this->actorId($request)));
        assert($restored instanceof Post);

        return ApiResponse::data(PostDTO::fromModel($restored));
    }

    private function actorId(Request $request): ?string
    {
        $introspection = $request->attributes->get('introspection');

        return $introspection?->userId;
    }
}
