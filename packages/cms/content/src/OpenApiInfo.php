<?php

declare(strict_types=1);

namespace Cms\Content;

use OpenApi\Attributes as OA;

#[OA\Info(version: '0.1.0', title: 'Platform Content API', description: 'API сервиса content платформы')]
#[OA\SecurityScheme(securityScheme: 'bearerAuth', type: 'http', scheme: 'bearer')]
#[OA\SecurityScheme(securityScheme: 'apiKey', type: 'apiKey', in: 'header', name: 'X-Api-Key')]
final class OpenApiInfo {}
