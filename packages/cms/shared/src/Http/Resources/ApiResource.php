<?php

declare(strict_types=1);

namespace Cms\Shared\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Базовый Resource платформы: воспроизводит envelope `ApiResponse` байт-в-байт
 * (`{"data": ...}`), чтобы перевод контроллеров с ручных массивов на Resources
 * не менял публичный HTTP-контракт.
 *
 * Не применяется к эндпоинтам, отвечающим БЕЗ конверта `data`
 * (`/internal/introspect`, `/webhooks/{provider}`, `/internal/cache-bust`) —
 * их плоский формат — контракт межсервисного взаимодействия (Safety Protocol, И3).
 */
abstract class ApiResource extends JsonResource
{
    /** Ответ 201 с тем же конвертом — аналог `ApiResponse::created()`. */
    public function toCreatedResponse(Request $request): JsonResponse
    {
        return $this->toResponse($request)->setStatusCode(201);
    }
}
