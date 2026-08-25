<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Content\Infrastructure\Support\RobotsGenerator;
use Cms\Content\Infrastructure\Support\SitemapGenerator;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Response;
use OpenApi\Attributes as OA;

final class SeoFilesController
{
    public function __construct(private readonly ProjectContext $context) {}

    #[OA\Get(path: '/sitemap.xml', operationId: 'content_sitemap_sitemap_xml', tags: ['content'], summary: 'GET /sitemap.xml', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function sitemap(SitemapGenerator $generator): Response
    {
        $projectId = $this->context->required();
        $xml = SitemapGenerator::read($projectId) ?? $generator->generate($projectId);

        return new Response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    #[OA\Get(path: '/robots.txt', operationId: 'content_robots_robots_txt', tags: ['content'], summary: 'GET /robots.txt', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function robots(RobotsGenerator $generator): Response
    {
        return new Response($generator->generate($this->context->required()), 200, ['Content-Type' => 'text/plain']);
    }
}
