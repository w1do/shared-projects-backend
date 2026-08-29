<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Analytics\Application\Commands\ExportReportCommand;
use Cms\Analytics\Application\Handlers\ExportReportHandler;
use Cms\Analytics\Application\Queries\OverviewQuery;
use Cms\Analytics\Application\Queries\RevenueQuery;
use Cms\Analytics\Application\Queries\TopPagesQuery;
use Cms\Analytics\Application\Queries\UserHistoryQuery;
use Cms\Analytics\Presentation\Http\Api\V1\Requests\Report\ReportPeriodRequest;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Report\OverviewRowResource;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Report\RevenueRowResource;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Report\TopPageRowResource;
use Cms\Analytics\Presentation\Http\Api\V1\Resources\Report\UserHistoryRowResource;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

/** Отчёты — только по MV; история — по ключу субъекта. */
final class ReportsController
{
    public function __construct(private readonly ProjectContext $context) {}

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/analytics/overview',
        operationId: 'analytics_overview_api_admin_v1_projects_project_analytics_overview',
        tags: ['analytics'],
        summary: 'GET /api/admin/v1/projects/{project}/analytics/overview',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function overview(ReportPeriodRequest $request, OverviewQuery $query): AnonymousResourceCollection
    {
        $period = $request->period();

        return OverviewRowResource::collection($query->handle($this->context->required(), $period->from, $period->to));
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/analytics/top-pages',
        operationId: 'analytics_topPages_api_admin_v1_projects_project_analytics_top_pages',
        tags: ['analytics'],
        summary: 'GET /api/admin/v1/projects/{project}/analytics/top-pages',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function topPages(ReportPeriodRequest $request, TopPagesQuery $query): AnonymousResourceCollection
    {
        $period = $request->period();

        return TopPageRowResource::collection($query->handle($this->context->required(), $period->from, $period->to));
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/analytics/revenue',
        operationId: 'analytics_revenue_api_admin_v1_projects_project_analytics_revenue',
        tags: ['analytics'],
        summary: 'GET /api/admin/v1/projects/{project}/analytics/revenue',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function revenue(ReportPeriodRequest $request, RevenueQuery $query): AnonymousResourceCollection
    {
        $period = $request->period();

        return RevenueRowResource::collection($query->handle($this->context->required(), $period->from, $period->to));
    }

    #[OA\Get(
        path: '/api/admin/v1/projects/{project}/analytics/history/{subjectKey}',
        operationId: 'analytics_history_api_admin_v1_projects_project_analytics_history_subjectkey',
        tags: ['analytics'],
        summary: 'GET /api/admin/v1/projects/{project}/analytics/history/{subjectKey}',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'subjectKey', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function history(string $project, string $subjectKey, UserHistoryQuery $query): AnonymousResourceCollection
    {
        // $project не используется, но остаётся в сигнатуре: route-параметры Laravel
        // подставляет ПОЗИЦИОННО, и без него в $subjectKey приедет ключ проекта.
        // Окно отчёта здесь не применяется: история субъекта отдаётся целиком.
        return UserHistoryRowResource::collection($query->handle($this->context->required(), $subjectKey));
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/analytics/export',
        operationId: 'analytics_export_api_admin_v1_projects_project_analytics_export',
        tags: ['analytics'],
        summary: 'POST /api/admin/v1/projects/{project}/analytics/export',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'project', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function export(ReportPeriodRequest $request, ExportReportHandler $handler): JsonResponse
    {
        $handler->handle(new ExportReportCommand($this->context->required(), $request->period()));

        return ApiResponse::accepted();
    }
}
