<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Queries;

use Cms\Contracts\Introspection\IntrospectionResult;

/**
 * Локали текущего проекта — из introspection auth-сервиса. Результат
 * интроспекции достаёт Presentation (атрибут запроса, положенный middleware'ом
 * авторизации) и передаёт сюда: HTTP-запрос в Application не попадает.
 * Первая локаль — локаль по умолчанию.
 */
final class ProjectLocalesQuery
{
    /** @return list<string> */
    public function handle(?IntrospectionResult $introspection): array
    {
        $locales = $introspection === null ? [] : $introspection->locales;

        return $locales !== [] ? $locales : ['en'];
    }

    public function defaultLocale(?IntrospectionResult $introspection): string
    {
        return $this->handle($introspection)[0];
    }
}
