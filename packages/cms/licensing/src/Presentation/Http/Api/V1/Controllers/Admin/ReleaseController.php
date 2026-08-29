<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\DeleteReleaseCommand;
use Cms\Licensing\Application\Commands\UpsertReleaseCommand;
use Cms\Licensing\Application\DTOs\Release\ReleaseDTO;
use Cms\Licensing\Application\Handlers\DeleteReleaseHandler;
use Cms\Licensing\Application\Handlers\UpsertReleaseHandler;
use Cms\Licensing\Application\Queries\FindReleaseQuery;
use Cms\Licensing\Application\Queries\ListReleasesQuery;
use Cms\Licensing\Domain\Models\Release;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\Release\UpsertReleaseRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Release\ReleaseCursorCollection;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Release\ReleaseResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Каталог релизов проекта: admin CRUD (спека licensing/releases). */
final class ReleaseController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/pay/licensing/releases',
        operationId: 'licensing_index_releases',
        tags: ['pay'],
        summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/releases',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')],
    )]
    public function index(Request $request, ListReleasesQuery $query): JsonResponse
    {
        return (new ReleaseCursorCollection($query->handle()))->toResponse($request);
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/pay/licensing/releases/{release}',
        operationId: 'licensing_show_release',
        tags: ['pay'],
        summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/releases/{release}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'release', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')],
    )]
    public function show(Request $request, string $project, int $releaseId, FindReleaseQuery $releases): JsonResponse
    {
        return (new ReleaseResource(ReleaseDTO::fromModel($releases->handle($releaseId))))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/licensing/releases',
        operationId: 'licensing_store_release',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/releases',
        security: [['bearerAuth' => []]],
        parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['version', 'train', 'repository', 'released_at'],
            properties: [
                new OA\Property(property: 'version', type: 'string', maxLength: 20),
                new OA\Property(property: 'train', type: 'string', maxLength: 10),
                new OA\Property(property: 'repository', type: 'string', maxLength: 255),
                new OA\Property(property: 'released_at', type: 'string', format: 'date'),
                new OA\Property(property: 'is_security', type: 'boolean'),
                new OA\Property(property: 'min_upgrade_from', type: 'string', nullable: true),
                new OA\Property(property: 'changelog_url', type: 'string', format: 'uri', maxLength: 255, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertReleaseRequest $request, UpsertReleaseHandler $handler): JsonResponse
    {
        $release = $handler->handle($this->command($request, null));

        return (new ReleaseResource(ReleaseDTO::fromModel($release)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/pay/licensing/releases/{release}',
        operationId: 'licensing_update_release',
        tags: ['pay'],
        summary: 'PUT /api/admin/v1/projects/{project}/pay/licensing/releases/{release}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'release', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['version', 'train', 'repository', 'released_at'],
            properties: [
                new OA\Property(property: 'version', type: 'string', maxLength: 20),
                new OA\Property(property: 'train', type: 'string', maxLength: 10),
                new OA\Property(property: 'repository', type: 'string', maxLength: 255),
                new OA\Property(property: 'released_at', type: 'string', format: 'date'),
                new OA\Property(property: 'is_security', type: 'boolean'),
                new OA\Property(property: 'min_upgrade_from', type: 'string', nullable: true),
                new OA\Property(property: 'changelog_url', type: 'string', format: 'uri', maxLength: 255, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(
        UpsertReleaseRequest $request,
        string $project,
        int $releaseId,
        FindReleaseQuery $releases,
        UpsertReleaseHandler $handler,
    ): JsonResponse {
        $release = $handler->handle($this->command($request, $releases->handle($releaseId)));

        return (new ReleaseResource(ReleaseDTO::fromModel($release)))->toResponse($request);
    }

    #[OA\Delete(
        path: '/api/admin/v1/projects/{project}/pay/licensing/releases/{release}',
        operationId: 'licensing_delete_release',
        tags: ['pay'],
        summary: 'DELETE /api/admin/v1/projects/{project}/pay/licensing/releases/{release}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'release', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')],
    )]
    public function destroy(
        Request $request,
        string $project,
        int $releaseId,
        FindReleaseQuery $releases,
        DeleteReleaseHandler $handler,
    ): JsonResponse {
        $handler->handle(new DeleteReleaseCommand($releases->handle($releaseId)));

        return ApiResponse::noContent();
    }

    private function command(UpsertReleaseRequest $request, ?Release $release): UpsertReleaseCommand
    {
        $validated = $request->validated();

        return new UpsertReleaseCommand(
            release: $release,
            version: (string) $validated['version'],
            train: (string) $validated['train'],
            repository: (string) $validated['repository'],
            releasedAt: new \DateTimeImmutable((string) $validated['released_at']),
            isSecurity: (bool) ($validated['is_security'] ?? false),
            minUpgradeFrom: isset($validated['min_upgrade_from']) ? (string) $validated['min_upgrade_from'] : null,
            changelogUrl: isset($validated['changelog_url']) ? (string) $validated['changelog_url'] : null,
        );
    }
}
