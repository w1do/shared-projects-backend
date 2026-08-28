<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Licensing\Application\Commands\RevokeInstallationCommand;
use Cms\Licensing\Application\DTOs\Installation\InstallationDTO;
use Cms\Licensing\Application\Handlers\RevokeInstallationHandler;
use Cms\Licensing\Application\Queries\FindInstallationQuery;
use Cms\Licensing\Application\Queries\FindLicenseQuery;
use Cms\Licensing\Application\Queries\ListInstallationsQuery;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\Installation\InstallationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Установки лицензий: список с фильтром «кто отстал» и отзыв копии (Д7/Д11). */
final class InstallationController
{
    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/installations',
        operationId: 'licensing_index_installations',
        tags: ['pay'],
        summary: 'GET /api/admin/v1/projects/{project}/pay/licensing/licenses/{license}/installations',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'license', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'filter[app_version_below]', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found')],
    )]
    public function index(
        Request $request,
        string $project,
        string $licenseId,
        FindLicenseQuery $licenses,
        ListInstallationsQuery $query,
    ): JsonResponse {
        $appVersionBelow = $request->query('filter')['app_version_below'] ?? null;

        $installations = $query->handle(
            $licenses->handle($licenseId),
            is_string($appVersionBelow) && $appVersionBelow !== '' ? $appVersionBelow : null,
        );

        return InstallationResource::collection(
            $installations->map(fn (LicenseInstallation $installation) => InstallationDTO::fromModel($installation)),
        )->toResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/licensing/installations/{installation}/revoke', operationId: 'licensing_revoke_installation', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/licensing/installations/{installation}/revoke', security: [['bearerAuth' => []]], parameters: [new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')), new OA\Parameter(name: 'installation', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 404, description: 'Not found'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revoke(
        Request $request,
        string $project,
        int $installationId,
        FindInstallationQuery $installations,
        RevokeInstallationHandler $handler,
    ): JsonResponse {
        $installation = $handler->handle(new RevokeInstallationCommand($installations->handle($installationId)));

        return (new InstallationResource(InstallationDTO::fromModel($installation)))->toResponse($request);
    }
}
