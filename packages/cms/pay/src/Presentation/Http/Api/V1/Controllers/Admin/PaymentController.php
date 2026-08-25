<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Pay\Application\Commands\ApplyPaymentStatusCommand;
use Cms\Pay\Application\Commands\RefundPaymentCommand;
use Cms\Pay\Application\DTOs\Payment\PaymentDTO;
use Cms\Pay\Application\DTOs\Payment\RefundDTO;
use Cms\Pay\Application\Handlers\ApplyPaymentStatusHandler;
use Cms\Pay\Application\Handlers\RefundPaymentHandler;
use Cms\Pay\Application\Queries\ListPayments;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Models\Payment;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

final class PaymentController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/pay/payments', operationId: 'pay_index_api_admin_v1_projects_project_pay_payments', tags: ['pay'], summary: 'GET /api/admin/v1/projects/{project}/pay/payments', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(ListPayments $query): JsonResponse
    {
        return ApiResponse::cursorPage($query->handle(), fn (Payment $p) => PaymentDTO::fromModel($p));
    }

    /** Ручное подтверждение оплаты по счёту (ManualProvider). */
    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/payments/{payment}/confirm', operationId: 'pay_confirm_api_admin_v1_projects_project_pay_payments_payment_confirm', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/payments/{payment}/confirm', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function confirm(string $project, string $paymentId, ApplyPaymentStatusHandler $handler): JsonResponse
    {
        $payment = Payment::query()->find($paymentId);
        if ($payment === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(PaymentDTO::fromModel(
            $handler->handle(new ApplyPaymentStatusCommand($payment, PaymentStatus::Succeeded)),
        ));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/pay/payments/{payment}/refund', operationId: 'pay_refund_api_admin_v1_projects_project_pay_payments_payment_refund', tags: ['pay'], summary: 'POST /api/admin/v1/projects/{project}/pay/payments/{payment}/refund', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function refund(RefundDTO $data, string $project, string $paymentId, RefundPaymentHandler $handler): JsonResponse
    {
        $payment = Payment::query()->find($paymentId);
        if ($payment === null) {
            return ErrorEnvelope::notFound();
        }

        return ApiResponse::data(PaymentDTO::fromModel($handler->handle(new RefundPaymentCommand($payment, $data))));
    }
}
