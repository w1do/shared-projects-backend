<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Queries;

use Cms\Auth\Application\DTOs\Introspection\IntrospectRequestDTO;
use Cms\Contracts\Introspection\IntrospectionResult;
use Spatie\LaravelData\Optional;

/**
 * Точка входа интроспекции: выбор источника субъекта по составу запроса.
 *
 * Токен приоритетнее ключа — так было и раньше: при обоих переданных полях
 * решает `token`.
 */
final class IntrospectQuery
{
    public function __construct(
        private readonly IntrospectTokenQuery $tokens,
        private readonly IntrospectApiKeyQuery $apiKeys,
    ) {}

    public function handle(IntrospectRequestDTO $data): IntrospectionResult
    {
        if (! $data->token instanceof Optional) {
            return $this->tokens->handle(
                $data->token,
                $data->project instanceof Optional ? null : $data->project,
            );
        }

        return $this->apiKeys->handle($data->api_key instanceof Optional ? '' : $data->api_key);
    }
}
