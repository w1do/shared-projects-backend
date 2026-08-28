<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Application\DTOs\Payment\PaymentDTO;
use Cms\Pay\Application\DTOs\Payment\RefundDTO;
use Cms\Pay\Application\Handlers\ApplyPaymentStatusHandler;
use Cms\Pay\Application\Handlers\RefundPaymentHandler;
use Cms\Pay\Application\Queries\ListPaymentsQuery;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Pay\Presentation\Http\Api\V1\Requests\Payment\RefundPaymentRequest;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Payment\PaymentCursorCollection;
use Cms\Pay\Presentation\Http\Api\V1\Resources\Payment\PaymentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class PaymentController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/payments', operationId: 'pay_index_api_admin_v1_projects_project_pay_payments', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/payments', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ListPaymentsQuery $query): JsonResponse
    {
        return (new PaymentCursorCollection($query->handle()))->toResponse($request);
    }

    /** Ручное подтверждение оплаты по счёту (ManualProvider). */
    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/payments/{payment}/confirm', operationId: 'pay_confirm_api_admin_v1_projects_project_pay_payments_payment_confirm', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/payments/{payment}/confirm', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function confirm(Request $request, string $project, string $paymentId, ApplyPaymentStatusHandler $handler): JsonResponse
    {
        // Скоуп проекта — глобальный (BelongsToProject); чужой платёж не находится
        // и даёт 404 тем же телом, что и прежний ручной конверт (задача 1.4).
        $payment = Payment::query()->findOrFail($paymentId);

        $updated = $handler->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded));

        return (new PaymentResource(PaymentDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Post(
        path: '/api/admin/v1/projects/{project}/pay/payments/{payment}/refund',
        operationId: 'pay_refund_api_admin_v1_projects_project_pay_payments_payment_refund',
        tags: ['pay'],
        summary: 'POST /api/admin/v1/projects/{project}/pay/payments/{payment}/refund',
        requestBody: new OA\RequestBody(required: false, content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'amount_minor', type: 'integer', minimum: 1),
            ],
        )),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function refund(RefundPaymentRequest $request, string $project, string $paymentId, RefundPaymentHandler $handler): JsonResponse
    {
        $payment = Payment::query()->findOrFail($paymentId);

        // Пустое тело → в validated() нет ключа → Optional → полный возврат (И1).
        $updated = $handler->handle(new RefundPaymentCommand($payment, RefundDTO::from($request->validated())));

        return (new PaymentResource(PaymentDTO::fromModel($updated)))->toResponse($request);
    }
}
