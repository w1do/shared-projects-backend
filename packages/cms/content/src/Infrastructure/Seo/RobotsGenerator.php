<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Seo;

use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Page;

/**
 * robots.txt проекта: правила из настроек + Disallow закрытых разделов
 * (noindex/is_index=false) + ссылка на sitemap.
 */
final class RobotsGenerator
{
    public function generate(string $projectId): string
    {
        $base = rtrim((string) (config('cms-content.site_url') ?: config('app.url')), '/');

        $lines = ['User-agent: *'];

        foreach ((array) config('cms-content.robots.disallow', ['/api/', '/admin/']) as $rule) {
            $lines[] = "Disallow: {$rule}";
        }

        // Закрытые от индексации страницы и категории
        $hiddenPages = Page::acrossProjects()->where('project_id', $projectId)
            ->where('is_index', false)->pluck('slug');
        foreach ($hiddenPages as $slug) {
            $lines[] = "Disallow: /{$slug}";
        }

        $hiddenCategories = Category::acrossProjects()->where('project_id', $projectId)
            ->where('is_index', false)->pluck('slug');
        foreach ($hiddenCategories as $slug) {
            $lines[] = "Disallow: /categories/{$slug}";
        }

        $lines[] = '';
        $lines[] = "Sitemap: {$base}/sitemap.xml";

        return implode("\n", $lines)."\n";
    }
}
