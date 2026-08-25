<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient;

use Cms\Contracts\Introspection\IntrospectionResult;

/**
 * Порт интроспекции токенов и API-ключей.
 *
 * Потребители (middleware, контроллеры, тестовые фейки) зависят от порта,
 * а не от конкретного `CachedIntrospector` с его кэшем и HTTP-клиентом.
 */
interface Introspector
{
    public function token(string $bearerToken, ?string $project = null): IntrospectionResult;

    public function apiKey(string $apiKey): IntrospectionResult;
}
