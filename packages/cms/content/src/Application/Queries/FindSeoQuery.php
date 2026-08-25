<?php

declare(strict_types=1);

namespace Cms\Content\Application\Queries;

use Cms\Content\Application\DTOs\Seo\SeoDTO;

/** SEO-блок носителя; `null` — блок ещё не заводили (снимок `seo-show-null`). */
final class FindSeoQuery
{
    public function __construct(private readonly FindSeoableQuery $seoable) {}

    public function handle(string $type, int $id): ?SeoDTO
    {
        $seo = $this->seoable->handle($type, $id)->seo;

        return $seo === null ? null : SeoDTO::fromModel($seo);
    }
}
