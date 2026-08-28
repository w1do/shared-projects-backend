<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\UpdatePaymentsSettingsCommand;
use Cms\Pay\Application\DTOs\Settings\PaymentsSettingsDTO;
use Cms\Pay\Application\Handlers\UpdatePaymentsSettingsHandler;
use Cms\Pay\Application\Queries\GetPaymentsSettingsQuery;
use Cms\Pay\Presentation\Http\Api\V1\Requests\Settings\UpdatePaymentsSettingsRequest;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Settings\PaymentsSettingsResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class SettingsController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/settings', operationId: 'pay_show_api_admin_v1_projects_project_pay_settings', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/settings', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 403, description: 'Forbidden')])]
    public function show(Request $request, GetPaymentsSettingsQuery $query): JsonResponse
    {
        return (new PaymentsSettingsResource($query->handle()))->toResponse($request);
    }

    #[OA\Put(
        path: '/api/admin/v1/projects/{project}/pay/settings',
        operationId: 'pay_update_api_admin_v1_projects_project_pay_settings',
        tags: ['pay'],
        summary: 'PUT /api/admin/v1/projects/{project}/pay/settings',
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ['provider'],
            properties: [
                new OA\Property(property: 'provider', type: 'string', enum: ['manual', 'null', 'platega']),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function update(UpdatePaymentsSettingsRequest $request, UpdatePaymentsSettingsHandler $handler): JsonResponse
    {
        $saved = $handler->handle(new UpdatePaymentsSettingsCommand(PaymentsSettingsDTO::fromValidated($request->validated())));

        return (new PaymentsSettingsResource($saved))->toResponse($request);
    }
}
