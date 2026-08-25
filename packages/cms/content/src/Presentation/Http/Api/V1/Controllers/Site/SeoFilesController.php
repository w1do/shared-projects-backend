<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Site;

use Cms\Content\Infrastructure\Jobs\RegenerateSitemapJob;
use Cms\Content\Infrastructure\Seo\RobotsGenerator;
use Cms\Content\Infrastructure\Seo\SitemapGenerator;
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
        $artifact = $generator->read($projectId);

        if ($artifact !== null) {
            // Артефакт есть — таблицы posts/pages/categories не читаются вовсе
            return $this->xml($artifact);
        }

        // Холодный старт: карта строится синхронно, иначе ответ был бы пустым
        // (п. Б9 «поведение, которое обязано остаться прежним»); регенерация
        // при этом ставится в очередь — следующие запросы берут артефакт.
        RegenerateSitemapJob::dispatch($projectId);

        return $this->xml($generator->generate($projectId));
    }

    #[OA\Get(path: '/robots.txt', operationId: 'content_robots_robots_txt', tags: ['content'], summary: 'GET /robots.txt', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function robots(RobotsGenerator $generator): Response
    {
        return new Response($generator->generate($this->context->required()), 200, ['Content-Type' => 'text/plain']);
    }

    private function xml(string $body): Response
    {
        return new Response($body, 200, ['Content-Type' => 'application/xml']);
    }
}
