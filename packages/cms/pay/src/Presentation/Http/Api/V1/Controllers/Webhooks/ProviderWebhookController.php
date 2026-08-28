<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Webhooks;

use Cms\Pay\Application\Commands\RegisterWebhookCommand;
use Cms\Pay\Application\Handlers\RegisterWebhookHandler;
use Cms\Pay\Infrastructure\Gateways\ProviderWebhookGateway;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Путь вебхука: подпись → INSERT (unique) → джоба → 200 за <100 мс.
 * Никакой бизнес-логики в HTTP-запросе.
 *
 * Ответ `{"received": true}` — плоский, БЕЗ конверта `data`: это контракт
 * провайдера, базовый Resource сюда не применяется (Safety Protocol, И3/Б2).
 * Ручной конверт 404 здесь тоже остаётся, в отличие от остальных
 * контроллеров pay: маршрут не подходит под шаблон api-путей, для которых
 * приложение рендерит `NotFoundHttpException` конвертом, и `findOrFail`-приём
 * задачи 1.4 отдал бы другое тело (снимок webhook-404).
 */
final class ProviderWebhookController
{
    public function __construct(private readonly ProviderWebhookGateway $gateway) {}

    #[OA\Post(
        path: '/webhooks/{provider}',
        operationId: 'pay___invoke_webhooks_provider',
        tags: ['pay'],
        summary: 'POST /webhooks/{provider}',
        parameters: [
            new OA\Parameter(name: 'provider', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['manual', 'null', 'platega'])),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(type: 'object', description: 'Payload провайдера, формат зависит от провайдера')),
        responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')],
    )]
    public function __invoke(Request $request, string $provider, RegisterWebhookHandler $handler): JsonResponse
    {
        if (! $this->gateway->supports($provider)) {
            return ErrorEnvelope::notFound();
        }

        if (! $this->gateway->verifySignature($provider, $request)) {
            return ErrorEnvelope::unauthorized('Invalid webhook signature.'); // ничего не пишем
        }

        $parsed = $this->gateway->parse($provider, $request->all());
        if ($parsed['external_id'] === '') {
            return ErrorEnvelope::validation(['payload' => ['Missing external id.']]);
        }

        $handler->handle(new RegisterWebhookCommand(
            $provider,
            $parsed['external_id'],
            $request->all(),
            $this->gateway->authSnapshot($provider, $request),
        ));

        // Дубль тоже получает 200 — провайдер не должен ретраить
        return new JsonResponse(['received' => true]);
    }
}
