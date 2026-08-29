<?php

declare(strict_types=1);

namespace Cms\Auth;

use OpenApi\Attributes as OA;

#[OA\Info(version: '0.1.0', title: 'Platform Auth API', description: 'API сервиса auth платформы')]
#[OA\SecurityScheme(securityScheme: 'bearerAuth', type: 'http', scheme: 'bearer')]
#[OA\SecurityScheme(securityScheme: 'apiKey', type: 'apiKey', in: 'header', name: 'X-Api-Key')]
#[OA\SecurityScheme(securityScheme: 'serviceToken', type: 'http', scheme: 'Service', description: 'Межсервисный SERVICE_TOKEN: Authorization: Service <token>')]
final class OpenApiInfo {}
