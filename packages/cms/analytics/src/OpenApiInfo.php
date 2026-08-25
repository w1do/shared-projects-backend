<?php

declare(strict_types=1);

namespace Cms\Analytics;

use OpenApi\Attributes as OA;

#[OA\Info(version: '0.1.0', title: 'Platform Analytics API', description: 'API сервиса analytics платформы')]
#[OA\SecurityScheme(securityScheme: 'bearerAuth', type: 'http', scheme: 'bearer')]
#[OA\SecurityScheme(securityScheme: 'apiKey', type: 'apiKey', in: 'header', name: 'X-Api-Key')]
final class OpenApiInfo {}
