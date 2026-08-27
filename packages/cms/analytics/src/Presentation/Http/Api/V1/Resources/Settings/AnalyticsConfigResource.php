<?php

declare(strict_types=1);

namespace Cms\Analytics\Presentation\Http\Api\V1\Resources\Settings;

use Cms\Analytics\Application\DTOs\Settings\AnalyticsSettingsDTO;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Публичный конфиг счётчиков для инъекции скриптов на сайте проекта:
 * id отдаётся только включённому провайдеру — выключенный не инициализируется.
 *
 * @property AnalyticsSettingsDTO $resource
 */
final class AnalyticsConfigResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'yandex' => [
                'enabled' => $this->resource->yandex_enabled,
                'id' => $this->resource->yandex_enabled ? $this->resource->yandex_id : null,
            ],
            'google' => [
                'enabled' => $this->resource->google_enabled,
                'id' => $this->resource->google_enabled ? $this->resource->google_id : null,
            ],
        ];
    }
}
