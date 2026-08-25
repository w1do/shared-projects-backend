<?php

declare(strict_types=1);

namespace Cms\Pay;

use OpenApi\Attributes as OA;

#[OA\Info(version: '0.1.0', description: 'API сервиса pay платформы', title: 'Platform Pay API')]
#[OA\SecurityScheme(securityScheme: 'bearerAuth', type: 'http', scheme: 'bearer')]
#[OA\SecurityScheme(securityScheme: 'apiKey', type: 'apiKey', name: 'X-Api-Key', in: 'header')]
final class OpenApiInfo {}
