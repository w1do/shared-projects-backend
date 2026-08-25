<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Analytics\Application\Queries\OverviewQuery;
use Cms\Analytics\Application\Queries\RevenueQuery;
use Cms\Analytics\Application\Queries\TopPagesQuery;
use Cms\Analytics\Application\Queries\UserHistoryQuery;
use Cms\Analytics\Infrastructure\Jobs\ExportReportJob;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/** Отчёты — только по MV; история — по ключу субъекта. */
final class ReportsController
{
    public function __construct(private readonly ProjectContext $context) {}

    #[OA\Get(path: '/api/admin/v1/projects/{project}/analytics/overview', operationId: 'analytics_overview_api_admin_v1_projects_project_analytics_overview', tags: ['analytics'], summary: 'GET /api/admin/v1/projects/{project}/analytics/overview', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function overview(Request $request, OverviewQuery $query): JsonResponse
    {
        [$from, $to] = $this->period($request);

        return ApiResponse::data($query->handle($this->context->required(), $from, $to));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/analytics/top-pages', operationId: 'analytics_topPages_api_admin_v1_projects_project_analytics_top_pages', tags: ['analytics'], summary: 'GET /api/admin/v1/projects/{project}/analytics/top-pages', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function topPages(Request $request, TopPagesQuery $query): JsonResponse
    {
        [$from, $to] = $this->period($request);

        return ApiResponse::data($query->handle($this->context->required(), $from, $to));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/analytics/revenue', operationId: 'analytics_revenue_api_admin_v1_projects_project_analytics_revenue', tags: ['analytics'], summary: 'GET /api/admin/v1/projects/{project}/analytics/revenue', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function revenue(Request $request, RevenueQuery $query): JsonResponse
    {
        [$from, $to] = $this->period($request);

        return ApiResponse::data($query->handle($this->context->required(), $from, $to));
    }

    #[OA\Get(path: '/api/admin/v1/projects/{project}/analytics/history/{subjectKey}', operationId: 'analytics_history_api_admin_v1_projects_project_analytics_history_subjectkey', tags: ['analytics'], summary: 'GET /api/admin/v1/projects/{project}/analytics/history/{subjectKey}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function history(Request $request, string $project, string $subjectKey, UserHistoryQuery $query): JsonResponse
    {
        return ApiResponse::data($query->handle($this->context->required(), $subjectKey));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/analytics/export', operationId: 'analytics_export_api_admin_v1_projects_project_analytics_export', tags: ['analytics'], summary: 'POST /api/admin/v1/projects/{project}/analytics/export', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function export(Request $request): JsonResponse
    {
        [$from, $to] = $this->period($request);
        ExportReportJob::dispatch($this->context->required(), $from, $to)->onQueue('exports');

        return ApiResponse::accepted();
    }

    /** @return array{0: string, 1: string} */
    private function period(Request $request): array
    {
        $request->validate([
            'from' => ['sometimes', 'date_format:Y-m-d'],
            'to' => ['sometimes', 'date_format:Y-m-d'],
        ]);

        return [
            (string) $request->query('from', now()->subDays(30)->toDateString()),
            (string) $request->query('to', now()->toDateString()),
        ];
    }
}
