<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\ChangeStatusCommand;
use Cms\Content\Application\Commands\DeletePostCommand;
use Cms\Content\Application\Commands\RestoreRevisionCommand;
use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Application\DTOs\Post\PostDTO;
use Cms\Content\Application\Handlers\ChangeStatusHandler;
use Cms\Content\Application\Handlers\DeletePostHandler;
use Cms\Content\Application\Handlers\RestoreRevisionHandler;
use Cms\Content\Application\Handlers\UpsertPostHandler;
use Cms\Content\Application\Queries\ListPostsQuery;
use Cms\Content\Application\Queries\ListRevisionsQuery;
use Cms\Content\Domain\Models\Post;
use Cms\Content\Presentation\Http\Api\V1\Requests\Post\UpsertPostRequest;
use Cms\Content\Presentation\Http\Api\V1\Requests\Status\ChangeStatusRequest;
use Cms\Content\Presentation\Http\Api\V1\Resources\Post\PostCursorCollection;
use Cms\Content\Presentation\Http\Api\V1\Resources\Post\PostResource;
use Cms\Content\Presentation\Http\Api\V1\Resources\Revision\RevisionResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class PostController
{
    public function __construct(private readonly RequestIntrospection $introspection) {}

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/content/posts',
        operationId: 'content_index_api_admin_v1_projects_project_content_posts',
        tags: ['content'],
        summary: 'GET /api/admin/v1/projects/{project}/content/posts',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['draft', 'scheduled', 'published', 'archived'])),
            new OA\Parameter(name: 'locale', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'category', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function index(Request $request, ListPostsQuery $query): JsonResponse
    {
        $page = $query->handle(
            status: $request->query('status'),
            locale: $request->query('locale'),
            categoryId: $request->query('category') !== null ? (int) $request->query('category') : null,
        );

        return (new PostCursorCollection($page))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/posts',
        operationId: 'content_store_api_admin_v1_projects_project_content_posts',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/posts',
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
                new OA\Property(property: 'translation_group', type: 'string', maxLength: 64, nullable: true),
                new OA\Property(property: 'categories', type: 'array', items: new OA\Items(type: 'integer')),
                new OA\Property(property: 'is_index', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertPostRequest $request, UpsertPostHandler $command): JsonResponse
    {
        $post = $command->handle(new UpsertPostCommand(
            $request->upsert(),
            authorId: $this->introspection->actorId($request),
        ));

        return (new PostResource(PostDTO::fromModel($post)))->toCreatedResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/posts/{post}', operationId: 'content_show_api_admin_v1_projects_project_content_posts_post', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/posts/{post}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function show(Request $request, string $project, int $postId): JsonResponse
    {
        $post = Post::query()->with(['categories:id', 'tags', 'seo'])->findOrFail($postId);

        return (new PostResource(PostDTO::fromModel($post)))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/content/posts/{post}',
        operationId: 'content_update_api_admin_v1_projects_project_content_posts_post',
        tags: ['content'],
        summary: 'PUT /api/admin/v1/projects/{project}/content/posts/{post}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['title'],
            properties: [
                new OA\Property(property: 'title', type: 'string', maxLength: 255),
                new OA\Property(property: 'slug', type: 'string', maxLength: 255),
                new OA\Property(property: 'body', type: 'string', nullable: true),
                new OA\Property(property: 'locale', type: 'string', maxLength: 10),
                new OA\Property(property: 'translation_group', type: 'string', maxLength: 64, nullable: true),
                new OA\Property(property: 'categories', type: 'array', items: new OA\Items(type: 'integer')),
                new OA\Property(property: 'is_index', type: 'boolean'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpsertPostRequest $request, string $project, int $postId, UpsertPostHandler $command): JsonResponse
    {
        $post = Post::query()->findOrFail($postId);

        $updated = $command->handle(new UpsertPostCommand(
            $request->upsert(),
            $post,
            $this->introspection->actorId($request),
        ));

        return (new PostResource(PostDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/posts/{post}/status',
        operationId: 'content_changeStatus_api_admin_v1_projects_project_content_posts_post_status',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/posts/{post}/status',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
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
    public function changeStatus(ChangeStatusRequest $request, string $project, int $postId, ChangeStatusHandler $command): JsonResponse
    {
        $post = Post::query()->findOrFail($postId);
        $updated = $command->handle(new ChangeStatusCommand($post, $request->change()));

        return (new PostResource(PostDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/posts/{post}/revisions', operationId: 'content_revisions_api_admin_v1_projects_project_content_posts_post_revisions', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/posts/{post}/revisions', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revisions(Request $request, string $project, int $postId, ListRevisionsQuery $query): JsonResponse
    {
        $post = Post::query()->findOrFail($postId);

        return RevisionResource::collection($query->handle($post))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/content/posts/{post}/revisions/{revision}/restore',
        operationId: 'content_restore_api_admin_v1_projects_project_content_posts_post_revisions_revision_restore',
        tags: ['content'],
        summary: 'POST /api/admin/v1/projects/{project}/content/posts/{post}/revisions/{revision}/restore',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'revision', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function restore(Request $request, string $project, int $postId, int $revisionId, RestoreRevisionHandler $command): JsonResponse
    {
        $post = Post::query()->findOrFail($postId);
        // Ревизия ищется в пределах поста: чужая ревизия даёт 404, а не 403 (И11)
        $revision = $post->revisions()->whereKey($revisionId)->firstOrFail();

        $restored = $command->handle(new RestoreRevisionCommand($post, $revision, $this->introspection->actorId($request)));

        return (new PostResource(PostDTO::fromModel($restored)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/content/posts/{post}', operationId: 'content_destroy_api_admin_v1_projects_project_content_posts_post', tags: ['content'], summary: 'DELETE /api/admin/v1/projects/{project}/content/posts/{post}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'post', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')])]
    public function destroy(string $project, int $postId, DeletePostHandler $command): JsonResponse
    {
        $command->handle(new DeletePostCommand(Post::query()->findOrFail($postId)));

        return ApiResponse::noContent();
    }
}
