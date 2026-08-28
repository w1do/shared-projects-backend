<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\IssueLicenseCommand;
use Cms\Licensing\Application\Commands\OfflineActivateLicenseCommand;
use Cms\Licensing\Application\Commands\RenewLicenseCommand;
use Cms\Licensing\Application\Commands\RevealLicenseKeyCommand;
use Cms\Licensing\Application\Commands\RevokeLicenseCommand;
use Cms\Licensing\Application\DTOs\License\LicenseDTO;
use Cms\Licensing\Application\Handlers\IssueLicenseHandler;
use Cms\Licensing\Application\Handlers\OfflineActivateLicenseHandler;
use Cms\Licensing\Application\Handlers\RenewLicenseHandler;
use Cms\Licensing\Application\Handlers\RevealLicenseKeyHandler;
use Cms\Licensing\Application\Handlers\RevokeLicenseHandler;
use Cms\Licensing\Application\Queries\FindLicenseQuery;
use Cms\Licensing\Application\Queries\FindOrganizationQuery;
use Cms\Licensing\Application\Queries\FindPlanQuery;
use Cms\Licensing\Application\Queries\ListLicensesQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\IssueLicenseRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\OfflineActivationRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\RenewLicenseRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\IssuedLicenseResource;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\LicenseCursorCollection;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\LicenseDetailsResource;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\LicenseResource;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\OfflineActivationResource;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\RevealedKeyResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Лицензии проекта: выпуск, продление, показ ключа, офлайн-активация, отзыв (Д2/Д8). */
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
        return (new LicenseDetailsResource($licenses->handle($licenseId)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/licensing/licenses',
        operationId: 'licensing_issue_license',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/licenses',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['organization_id', 'plan_id', 'updates_until'],
            properties: [
                new OA\Property(property: 'organization_id', type: 'integer'),
                new OA\Property(property: 'plan_id', type: 'integer'),
                new OA\Property(property: 'updates_until', type: 'string', format: 'date'),
                new OA\Property(property: 'max_installations', type: 'integer', minimum: 1, maximum: 1000),
                new OA\Property(property: 'entitled_version', type: 'string', nullable: true),
                new OA\Property(property: 'note', type: 'string', maxLength: 2000, nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function store(
        IssueLicenseRequest $request,
        FindOrganizationQuery $organizations,
        FindPlanQuery $plans,
        IssueLicenseHandler $handler,
    ): JsonResponse {
        $validated = $request->validated();

        $issued = $handler->handle(new IssueLicenseCommand(
            organization: $organizations->handle((int) $validated['organization_id']),
            plan: $plans->handle((int) $validated['plan_id']),
            updatesUntil: new \DateTimeImmutable((string) $validated['updates_until']),
            maxInstallations: (int) ($validated['max_installations'] ?? 1),
            entitledVersion: isset($validated['entitled_version']) ? (string) $validated['entitled_version'] : null,
            note: isset($validated['note']) ? (string) $validated['note'] : null,
        ));

        return (new IssuedLicenseResource($issued))->toCreatedResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/renew',
        operationId: 'licensing_renew_license',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/renew',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['updates_until'],
            properties: [
                new OA\Property(property: 'updates_until', type: 'string', format: 'date'),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function renew(
        RenewLicenseRequest $request,
        string $project,
        string $licenseId,
        FindLicenseQuery $licenses,
        RenewLicenseHandler $handler,
    ): JsonResponse {
        $license = $handler->handle(new RenewLicenseCommand(
            license: $licenses->handle($licenseId),
            updatesUntil: new \DateTimeImmutable((string) $request->validated()['updates_until']),
        ));

        return (new LicenseResource(LicenseDTO::fromModel($license)))->toResponse($request);
    }

    /** Ключ авто-выпущенной лицензии показывается один раз (Д8). */
    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/reveal-key', operationId: 'licensing_reveal_license_key', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/reveal-key', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revealKey(
        Request $request,
        string $project,
        string $licenseId,
        FindLicenseQuery $licenses,
        RevealLicenseKeyHandler $handler,
    ): JsonResponse {
        $revealed = $handler->handle(new RevealLicenseKeyCommand($licenses->handle($licenseId)));

        return (new RevealedKeyResource($revealed))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/offline-activation',
        operationId: 'licensing_offline_activation',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/offline-activation',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['install_id', 'domain'],
            properties: [
                new OA\Property(property: 'install_id', type: 'string'),
                new OA\Property(property: 'domain', type: 'string', maxLength: 255),
                new OA\Property(property: 'app_version', type: 'string', nullable: true),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function offlineActivation(
        OfflineActivationRequest $request,
        string $project,
        string $licenseId,
        FindLicenseQuery $licenses,
        OfflineActivateLicenseHandler $handler,
    ): JsonResponse {
        $validated = $request->validated();

        $result = $handler->handle(new OfflineActivateLicenseCommand(
            license: $licenses->handle($licenseId),
            installId: (string) $validated['install_id'],
            domain: (string) $validated['domain'],
            appVersion: isset($validated['app_version']) ? (string) $validated['app_version'] : null,
        ));

        return (new OfflineActivationResource($result))->toResponse($request);
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
}
