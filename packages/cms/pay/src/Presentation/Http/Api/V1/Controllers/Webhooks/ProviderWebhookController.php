<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Controllers\Webhooks;

use Cms\Pay\Application\Commands\RegisterWebhookCommand;
use Cms\Pay\Application\Handlers\RegisterWebhookHandler;
use Cms\Pay\Infrastructure\Providers\ProviderRegistry;
use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * Путь вебхука: подпись → INSERT (unique) → джоба → 200 за <100 мс.
 * Никакой бизнес-логики в HTTP-запросе.
 */
final class ProviderWebhookController
{
    #[OA\Post(path: '/webhooks/{provider}', operationId: 'pay___invoke_webhooks_provider', tags: ['pay'], summary: 'POST /webhooks/{provider}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function __invoke(Request $request, string $provider, RegisterWebhookHandler $handler): JsonResponse
    {
        if (! in_array($provider, ProviderRegistry::available(), true)) {
            return ErrorEnvelope::notFound();
        }

        $adapter = app(ProviderRegistry::class)->for('-', $provider);

        if (! $adapter->verifyWebhook($request)) {
            return ErrorEnvelope::unauthorized('Invalid webhook signature.'); // ничего не пишем
        }

        $parsed = $adapter->parseWebhook($request->all());
        if ($parsed['external_id'] === '') {
            return ErrorEnvelope::validation(['payload' => ['Missing external id.']]);
        }

        $handler->handle(new RegisterWebhookCommand($provider, $parsed['external_id'], $request->all()));

        // Дубль тоже получает 200 — провайдер не должен ретраить
        return new JsonResponse(['received' => true]);
    }
}
