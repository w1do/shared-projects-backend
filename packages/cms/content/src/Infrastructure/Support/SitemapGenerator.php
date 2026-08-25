<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Support;

use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Page;
use Cms\Content\Domain\Models\Post;
use Illuminate\Support\Facades\Storage;

/**
 * Sitemap.xml проекта: только published + is_index = true, noindex исключается.
 * Хранится артефактом на диске и отдаётся публичным маршрутом.
 */
final class SitemapGenerator
{
    public function generate(string $projectId): string
    {
        $base = rtrim((string) config('cms-content.site_url', config('app.url')), '/');
        $urls = [];

        $posts = Post::acrossProjects()->where('project_id', $projectId)
            ->published()->where('is_index', true)->with('seo')->get();
        foreach ($posts as $post) {
            if ($post->seo?->isNoindex()) {
                continue;
            }
            $urls[] = ['loc' => "{$base}/posts/{$post->slug}", 'lastmod' => $post->updated_at];
        }

        $pages = Page::acrossProjects()->where('project_id', $projectId)
            ->published()->where('is_index', true)->with('seo')->get();
        foreach ($pages as $page) {
            if ($page->seo?->isNoindex()) {
                continue;
            }
            $urls[] = ['loc' => "{$base}/{$page->slug}", 'lastmod' => $page->updated_at];
        }

        $categories = Category::acrossProjects()->where('project_id', $projectId)
            ->where('is_index', true)->with('seo')->get();
        foreach ($categories as $category) {
            if ($category->seo?->isNoindex()) {
                continue;
            }
            $urls[] = ['loc' => "{$base}/categories/{$category->slug}", 'lastmod' => $category->updated_at];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $url) {
            $xml .= '  <url><loc>'.e($url['loc']).'</loc><lastmod>'
                .$url['lastmod']?->toDateString().'</lastmod></url>'."\n";
        }
        $xml .= '</urlset>'."\n";

        Storage::disk(self::disk())->put(self::path($projectId), $xml);

        return $xml;
    }

    public static function read(string $projectId): ?string
    {
        $disk = Storage::disk(self::disk());

        return $disk->exists(self::path($projectId)) ? $disk->get(self::path($projectId)) : null;
    }

    private static function disk(): string
    {
        return (string) config('cms-content.artifacts_disk', 'local');
    }

    private static function path(string $projectId): string
    {
        return "sitemaps/{$projectId}/sitemap.xml";
    }
}
