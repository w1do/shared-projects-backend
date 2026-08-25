<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Introspection;

use Cms\Contracts\Introspection\IntrospectionResult;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Ответ `/internal/introspect` — ПЛОСКИЙ, без конверта `data` (инвариант И3).
 *
 * Поэтому наследуется `JsonResource` с отключённой обёрткой, а не платформенный
 * `ApiResource`: конверт здесь сломал бы `IntrospectionResult::fromArray()` во
 * всех downstream-сервисах, причём молча — он отвечает `active=false`, а не
 * исключением, и результат кэшируется.
 *
 * @property IntrospectionResult $resource
 */
final class IntrospectionResource extends JsonResource
{
    /** @var string|null */
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return $this->resource->toArray();
    }
}
