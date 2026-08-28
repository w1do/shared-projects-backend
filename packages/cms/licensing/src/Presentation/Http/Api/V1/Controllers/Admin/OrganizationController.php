<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\DeleteOrganizationCommand;
use Cms\Licensing\Application\Commands\UpsertOrganizationCommand;
use Cms\Licensing\Application\DTOs\Organization\OrganizationDTO;
use Cms\Licensing\Application\DTOs\Organization\UpsertOrganizationDTO;
use Cms\Licensing\Application\Handlers\DeleteOrganizationHandler;
use Cms\Licensing\Application\Handlers\UpsertOrganizationHandler;
use Cms\Licensing\Application\Queries\FindOrganizationQuery;
use Cms\Licensing\Application\Queries\ListOrganizationsQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\Organization\UpsertOrganizationRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Organization\OrganizationCursorCollection;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Organization\OrganizationResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Реестр организаций-покупателей self-hosted-поставок: admin CRUD. */
final class OrganizationController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/licensing/organizations', operationId: 'licensing_index_organizations', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/organizations', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'cursor', in: 'query', required: false, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(Request $request, ListOrganizationsQuery $query): JsonResponse
    {
        return (new OrganizationCursorCollection($query->handle()))->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', operationId: 'licensing_show_organization', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'organization', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')])]
    public function show(Request $request, string $project, int $organizationId, FindOrganizationQuery $organizations): JsonResponse
    {
        $organization = $organizations->handle($organizationId);

        return (new OrganizationResource(OrganizationDTO::fromModel($organization)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/licensing/organizations',
        operationId: 'licensing_store_organization',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/organizations',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['name', 'contact_first_name', 'contact_last_name', 'email'],
            properties: [
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'contact_first_name', type: 'string', maxLength: 255),
                new OA\Property(property: 'contact_last_name', type: 'string', maxLength: 255),
                new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255),
                new OA\Property(property: 'phone', type: 'string', maxLength: 32, nullable: true),
                new OA\Property(property: 'telegram', type: 'string', maxLength: 64, nullable: true),
                new OA\Property(property: 'activity', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'employees_count', type: 'integer', minimum: 0, nullable: true),
                new OA\Property(property: 'usage_purpose', type: 'string', maxLength: 512, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(UpsertOrganizationRequest $request, UpsertOrganizationHandler $handler): JsonResponse
    {
        $organization = $handler->handle(new UpsertOrganizationCommand(
            UpsertOrganizationDTO::from($request->validated()),
        ));

        return (new OrganizationResource(OrganizationDTO::fromModel($organization)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}',
        operationId: 'licensing_update_organization',
        tags: ['pay'],
        summary: 'PUT /api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'organization', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['name', 'contact_first_name', 'contact_last_name', 'email'],
            properties: [
                new OA\Property(property: 'name', type: 'string', maxLength: 255),
                new OA\Property(property: 'contact_first_name', type: 'string', maxLength: 255),
                new OA\Property(property: 'contact_last_name', type: 'string', maxLength: 255),
                new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255),
                new OA\Property(property: 'phone', type: 'string', maxLength: 32, nullable: true),
                new OA\Property(property: 'telegram', type: 'string', maxLength: 64, nullable: true),
                new OA\Property(property: 'activity', type: 'string', maxLength: 255, nullable: true),
                new OA\Property(property: 'employees_count', type: 'integer', minimum: 0, nullable: true),
                new OA\Property(property: 'usage_purpose', type: 'string', maxLength: 512, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(
        UpsertOrganizationRequest $request,
        string $project,
        int $organizationId,
        FindOrganizationQuery $organizations,
        UpsertOrganizationHandler $handler,
    ): JsonResponse {
        $organization = $handler->handle(new UpsertOrganizationCommand(
            UpsertOrganizationDTO::from($request->validated()),
            $organizations->handle($organizationId),
        ));

        return (new OrganizationResource(OrganizationDTO::fromModel($organization)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', operationId: 'licensing_delete_organization', tags: ['pay'], summary: 'DELETE /api/admin/v1/projects/{project}/pay/licensing/organizations/{organization}', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'organization', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(
        Request $request,
        string $project,
        int $organizationId,
        FindOrganizationQuery $organizations,
        DeleteOrganizationHandler $handler,
    ): JsonResponse {
        $handler->handle(new DeleteOrganizationCommand($organizations->handle($organizationId)));

        return ApiResponse::noContent();
    }
}
