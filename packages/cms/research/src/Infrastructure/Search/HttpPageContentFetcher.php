<?php

declare(strict_types=1);

namespace Cms\Research\Infrastructure\Search;

use Cms\Research\Domain\Contracts\PageContentFetcher;
use Cms\Research\Domain\ValueObjects\PageContent;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Http\Client\Factory as HttpFactory;
use Throwable;

/** Загрузка страницы-источника и очистка её до простого текста. */
final readonly class HttpPageContentFetcher implements PageContentFetcher
{
    public function __construct(
        private HttpFactory $http,
        private Config $config,
    ) {}

    public function fetch(string $url): ?PageContent
    {
        if (! $this->isSafeUrl($url)) {
            return null;
        }

        try {
            $response = $this->http
                ->timeout((int) $this->config->get('cms-research.page_fetch_timeout', 10))
                ->get($url);
        } catch (Throwable) {
            return null;
        }

        if ($response->failed()) {
            return null;
        }

        $html = $response->body();

        if (trim($html) === '') {
            return null;
        }

        $title = null;
        if (preg_match('/<title[^>]*>(.*?)<\/title>/si', $html, $matches) === 1) {
            $title = trim(html_entity_decode(strip_tags($matches[1])));
        }

        $body = preg_replace('/<(script|style)\b[^>]*>.*?<\/\1>/si', ' ', $html) ?? $html;
        $text = trim(html_entity_decode(strip_tags($body)));
        $text = trim(preg_replace('/\s+/', ' ', $text) ?? $text);

        if ($text === '') {
            return null;
        }

        $maxLength = (int) $this->config->get('cms-research.max_content_length', 5000);

        return new PageContent(
            link: $url,
            content: mb_substr($text, 0, $maxLength),
            title: $title !== '' ? $title : null,
        );
    }

    /**
     * SSRF-guard: только http/https, без литеральных приватных IP и явных внутренних
     * имён. URL приходят из поисковой выдачи, то есть напрямую пользователем не
     * контролируются, но полагаться на благонадёжность внешней службы — не защита:
     * подставная страница в выдаче могла бы увести запрос в метаданные облака
     * (169.254.169.254) или на внутренние сервисы.
     *
     * DNS здесь сознательно не резолвится: guard остаётся герметичным для тестов и не
     * добавляет сетевой вызов на каждый URL. Имя хоста, указывающее на приватный адрес
     * через собственную DNS-запись, — принятый остаточный риск.
     */
    private function isSafeUrl(string $url): bool
    {
        $parts = parse_url($url);

        if ($parts === false || ! isset($parts['host'])) {
            return false;
        }

        if (! in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)) {
            return false;
        }

        $host = strtolower(trim($parts['host'], '[]'));

        if ($host === 'localhost' || str_ends_with($host, '.localhost')
            || str_ends_with($host, '.local') || str_ends_with($host, '.internal')
            || ! str_contains($host, '.')) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP) === false) {
            return true;
        }

        return filter_var(
            $host,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) !== false;
    }
}
