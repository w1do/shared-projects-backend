<?php

declare(strict_types=1);

namespace Cms\Licensing\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Licensing\Application\Queries\ValidateLicenseQuery;
use Cms\Licensing\Presentation\Http\Api\V1\Requests\License\ValidateLicenseRequest;
use Cms\Licensing\Presentation\Http\Api\V1\Resources\License\LicenseValidationResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * Публичная онлайн-валидация активационного ключа (Д6): без аутентификации —
 * ключ и есть аутентификация; ответы невалидных ключей неразличимы.
 */
final class ValidateLicenseController
{
    #[OA\Post(path: '/api/v1/pay/licensing/validate', operationId: 'licensing_validate_key', tags: ['pay'], summary: 'POST /api/v1/pay/licensing/validate', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 422, description: 'Validation error'), new OA\Response(response: 429, description: 'Too many requests')])]
    public function __invoke(ValidateLicenseRequest $request, ValidateLicenseQuery $query): JsonResponse
    {
        $validated = $request->validated();

        return (new LicenseValidationResource($query->handle((string) $validated['key'])))->toResponse($request);
    }
}
