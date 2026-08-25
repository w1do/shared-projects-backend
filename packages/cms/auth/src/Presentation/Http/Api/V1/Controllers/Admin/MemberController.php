<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Auth\Application\Commands\AssignMemberRoleCommand;
use Cms\Auth\Application\Commands\InviteMemberCommand;
use Cms\Auth\Application\Commands\RemoveMemberCommand;
use Cms\Auth\Application\DTOs\Member\InviteMemberDTO;
use Cms\Auth\Application\DTOs\Role\AssignRoleDTO;
use Cms\Auth\Application\Handlers\AssignMemberRoleHandler;
use Cms\Auth\Application\Handlers\InviteMemberHandler;
use Cms\Auth\Application\Handlers\RemoveMemberHandler;
use Cms\Auth\Application\Queries\ListMembers;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class MemberController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/members', operationId: 'auth_index_api_admin_v1_projects_project_members', tags: ['auth'], summary: 'GET /api/admin/v1/projects/{project}/members', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListMembers $query): JsonResponse
    {
        return ApiResponse::data($query->handle($request->attributes->get('project')));
    }

    public function store(InviteMemberDTO $data, Request $request, InviteMemberHandler $command): JsonResponse
    {
        $member = $command->handle(new InviteMemberCommand($request->attributes->get('project'), $data));

        return ApiResponse::created(['id' => $member->id, 'role' => $data->role]);
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/members/{member}/role', operationId: 'auth_assignRole_api_admin_v1_projects_project_members_member_role', tags: ['auth'], summary: 'PUT /api/admin/v1/projects/{project}/members/{member}/role', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function assignRole(AssignRoleDTO $data, Request $request, string $project, int $memberId, AssignMemberRoleHandler $command): JsonResponse
    {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        /** @var Admin|null $member */
        $member = $projectModel->members()->whereKey($memberId)->first();
        if ($member === null) {
            return ErrorEnvelope::notFound();
        }

        $command->handle(new AssignMemberRoleCommand($projectModel, $member, $data->role));

        return ApiResponse::data(['id' => $member->id, 'role' => $data->role]);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/members/{member}', operationId: 'auth_destroy_api_admin_v1_projects_project_members_member', tags: ['auth'], summary: 'DELETE /api/admin/v1/projects/{project}/members/{member}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function destroy(Request $request, string $project, int $memberId, RemoveMemberHandler $command): JsonResponse
    {
        /** @var Project $projectModel */
        $projectModel = $request->attributes->get('project');

        /** @var Admin|null $member */
        $member = $projectModel->members()->whereKey($memberId)->first();
        if ($member === null) {
            return ErrorEnvelope::notFound();
        }

        $command->handle(new RemoveMemberCommand($projectModel, $member));

        return ApiResponse::noContent();
    }
}
