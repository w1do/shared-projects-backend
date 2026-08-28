<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\IssueLicenseCommand;
use Cms\Licensing\Application\Commands\RevokeLicenseCommand;
use Cms\Licensing\Application\DTOs\License\LicenseDTO;
use Cms\Licensing\Application\Handlers\IssueLicenseHandler;
use Cms\Licensing\Application\Handlers\RevokeLicenseHandler;
use Cms\Licensing\Application\Queries\FindLicenseQuery;
use Cms\Licensing\Application\Queries\FindOrganizationQuery;
use Cms\Licensing\Application\Queries\FindPlanQuery;
use Cms\Licensing\Application\Queries\ListLicensesQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\IssueLicenseRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\LicenseCursorCollection;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\LicenseResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use OpenApi\Attributes as OA;

/** Лицензии проекта: выпуск, список, файл, отзыв (Д3/Д5). */
final class LicenseController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/licensing/licenses', operationId: 'licensing_index_licenses', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/licenses', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function index(Request $request, ListLicensesQuery $query): JsonResponse
    {
        return (new LicenseCursorCollection($query->handle()))->toResponse($request);
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}', operationId: 'licensing_show_license', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')])]
    public function show(Request $request, string $project, string $licenseId, FindLicenseQuery $licenses): JsonResponse
    {
        return (new LicenseResource(LicenseDTO::fromModel($licenses->handle($licenseId))))->toResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/licensing/licenses', operationId: 'licensing_issue_license', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/licenses', responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function store(
        IssueLicenseRequest $request,
        FindOrganizationQuery $organizations,
        FindPlanQuery $plans,
        IssueLicenseHandler $handler,
    ): JsonResponse {
        $validated = $request->validated();

        $license = $handler->handle(new IssueLicenseCommand(
            organization: $organizations->handle((int) $validated['organization_id']),
            plan: $plans->handle((int) $validated['plan_id']),
            expiresAt: new \DateTimeImmutable((string) $validated['expires_at']),
        ));

        return (new LicenseResource(LicenseDTO::fromModel($license)))->toCreatedResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/revoke', operationId: 'licensing_revoke_license', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/revoke', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revoke(
        Request $request,
        string $project,
        string $licenseId,
        FindLicenseQuery $licenses,
        RevokeLicenseHandler $handler,
    ): JsonResponse {
        $license = $handler->handle(new RevokeLicenseCommand($licenses->handle($licenseId)));

        return (new LicenseResource(LicenseDTO::fromModel($license)))->toResponse($request);
    }

    /** Лицензионный файл — base64-конверт `{data, signature}` (Д3). */
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/file', operationId: 'licensing_license_file', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/file', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')])]
    public function file(Request $request, string $project, string $licenseId, FindLicenseQuery $licenses): Response
    {
        $license = $licenses->handle($licenseId);

        return new Response($license->signed_payload, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"license-{$license->key}.lic\"",
        ]);
    }
}
