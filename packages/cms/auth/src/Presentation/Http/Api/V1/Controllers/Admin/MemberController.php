<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\AssignMemberRoleCommand;
use Cms\Auth\Application\Commands\InviteMemberCommand;
use Cms\Auth\Application\Commands\RemoveMemberCommand;
use Cms\Auth\Application\DTOs\Member\InviteMemberDTO;
use Cms\Auth\Application\DTOs\Member\MemberRoleDTO;
use Cms\Auth\Application\DTOs\Role\AssignRoleDTO;
use Cms\Auth\Application\Handlers\AssignMemberRoleHandler;
use Cms\Auth\Application\Handlers\InviteMemberHandler;
use Cms\Auth\Application\Handlers\RemoveMemberHandler;
use Cms\Auth\Application\Queries\FindProjectMemberQuery;
use Cms\Auth\Application\Queries\ListMembersQuery;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Member\AssignRoleRequest;
use Cms\Auth\Presentation\Http\Api\V1\Requests\Member\InviteMemberRequest;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Member\MemberResource;
use Cms\Auth\Presentation\Http\Api\V1\Resources\Member\MemberRoleResource;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class MemberController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/members', operationId: 'auth_index_api_admin_v1_projects_project_members', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/members', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListMembersQuery $query): JsonResponse
    {
        return MemberResource::collection($query->handle($request->attributes->get('project')))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/members',
        operationId: 'auth_store_api_admin_v1_projects_project_members',
        tags: ['auth'],
        summary: 'POST /api/admin/v1/projects/{project}/members',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['email', 'role'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255),
                new OA\Property(property: 'role', type: 'string'),
                new OA\Property(property: 'name', type: 'string', maxLength: 255, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(InviteMemberRequest $request, InviteMemberHandler $command): JsonResponse
    {
        $data = InviteMemberDTO::from($request->validated());
        $member = $command->handle(new InviteMemberCommand($request->attributes->get('project'), $data));

        return (new MemberRoleResource(new MemberRoleDTO($member->id, $data->role)))->toCreatedResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/members/{member}/role',
        operationId: 'auth_assignRole_api_admin_v1_projects_project_members_member_role',
        tags: ['auth'],
        summary: 'PUT /api/admin/v1/projects/{project}/members/{member}/role',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['role'],
            properties: [
                new OA\Property(property: 'role', type: 'string', maxLength: 64),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function assignRole(
        AssignRoleRequest $request,
        string $project,
        int $memberId,
        AssignMemberRoleHandler $command,
        FindProjectMemberQuery $members,
    ): JsonResponse {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        $data = AssignRoleDTO::from($request->validated());
        $member = $members->handle($projectModel, $memberId);

        $command->handle(new AssignMemberRoleCommand($projectModel, $member, $data->role));

        return (new MemberRoleResource(new MemberRoleDTO($member->id, $data->role)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/members/{member}', operationId: 'auth_destroy_api_admin_v1_projects_project_members_member', tags: ['auth'], summary: 'DELETE /api/admin/v1/projects/{project}/members/{member}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(
        Request $request,
        string $project,
        int $memberId,
        RemoveMemberHandler $command,
        FindProjectMemberQuery $members,
    ): JsonResponse {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        $command->handle(new RemoveMemberCommand($projectModel, $members->handle($projectModel, $memberId)));

        return ApiResponse::noContent();
    }
}
