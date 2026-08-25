<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Queries;

use Cms\Contracts\Introspection\IntrospectionResult;
use Illuminate\Http\Request;

/**
 * Локали текущего проекта — из introspection auth-сервиса (атрибут запроса,
 * положенный middleware'ом авторизации). Первая локаль — локаль по умолчанию.
 */
final class ProjectLocalesQuery
{
    /** @return list<string> */
    public function handle(Request $request): array
    {
        $introspection = $request->attributes->get('introspection');
        $locales = $introspection instanceof IntrospectionResult ? $introspection->locales : [];

        return $locales !== [] ? $locales : ['en'];
    }

    public function defaultLocale(Request $request): string
    {
        return $this->handle($request)[0];
    }
}
