<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Http;

use Cms\Content\Application\Exceptions\ContentRuleViolation;
use Cms\Content\Domain\Contracts\HostResolver;
use Cms\Content\Domain\Contracts\RemoteFileFetcher;
use Cms\Content\Domain\ValueObjects\RemoteFile;
use finfo;
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\StreamInterface;
use Psr\Http\Message\UriInterface;
use Throwable;

/**
 * Скачивание по внешней ссылке под ограничениями: только http/https, публичный
 * адрес (в том числе на каждом редиректе), таймаут, предел числа редиректов и
 * предел размера — тело читается порциями и обрывается на превышении.
 */
final class GuardedRemoteFileFetcher implements RemoteFileFetcher
{
    private const CHUNK = 8192;

    public function __construct(private readonly HostResolver $resolver) {}

    public function fetch(string $url): RemoteFile
    {
        $this->assertAllowedUrl($url);

        try {
            $response = Http::timeout($this->timeout())
                ->withOptions([
                    'stream' => true,
                    'allow_redirects' => [
                        'max' => $this->maxRedirects(),
                        'strict' => true,
                        'referer' => false,
                        'protocols' => ['http', 'https'],
                        'on_redirect' => function (mixed $request, mixed $response, UriInterface $uri): void {
                            $this->assertAllowedUrl((string) $uri);
                        },
                    ],
                ])
                ->get($url);
        } catch (ContentRuleViolation $violation) {
            // Отказ по адресу редиректа — уже осмысленное сообщение, не «не скачалось»
            throw $violation;
        } catch (Throwable) {
            throw ContentRuleViolation::remoteFileUnreachable();
        }

        if (! $response->successful()) {
            throw ContentRuleViolation::remoteFileUnreachable();
        }

        $contents = $this->readCapped($response->toPsrResponse()->getBody());
        $mime = (string) (new finfo(FILEINFO_MIME_TYPE))->buffer($contents);
        $extension = $this->allowedMimes()[$mime] ?? null;

        if ($extension === null) {
            throw ContentRuleViolation::remoteFileRejected();
        }

        return new RemoteFile($contents, $mime, strlen($contents), $extension);
    }

    /** Тело читается порциями: превышение предела обрывает чтение, а не расходует память. */
    private function readCapped(StreamInterface $body): string
    {
        $limit = $this->maxBytes();
        $contents = '';

        while (! $body->eof()) {
            $contents .= $body->read(self::CHUNK);

            if (strlen($contents) > $limit) {
                throw ContentRuleViolation::remoteFileRejected();
            }
        }

        if ($contents === '') {
            throw ContentRuleViolation::remoteFileRejected();
        }

        return $contents;
    }

    /** Схема, имя и все его адреса: приватные и loopback-диапазоны запрещены. */
    private function assertAllowedUrl(string $url): void
    {
        $parts = parse_url($url);
        $scheme = is_array($parts) ? ($parts['scheme'] ?? null) : null;
        $host = is_array($parts) ? ($parts['host'] ?? null) : null;

        if (! in_array($scheme, ['http', 'https'], true) || ! is_string($host) || $host === '') {
            throw ContentRuleViolation::remoteAddressNotAllowed();
        }

        $host = trim($host, '[]');
        $addresses = filter_var($host, FILTER_VALIDATE_IP) !== false
            ? [$host]
            : $this->resolver->addresses($host);

        if ($addresses === []) {
            throw ContentRuleViolation::remoteAddressNotAllowed();
        }

        foreach ($addresses as $address) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                throw ContentRuleViolation::remoteAddressNotAllowed();
            }
        }
    }

    private function timeout(): int
    {
        return (int) config('cms-content.media_import.timeout', 10);
    }

    private function maxRedirects(): int
    {
        return (int) config('cms-content.media_import.max_redirects', 3);
    }

    private function maxBytes(): int
    {
        return (int) config('cms-content.media_max_size_kb', 20480) * 1024;
    }

    /** @return array<string, string> mime => расширение файла */
    private function allowedMimes(): array
    {
        $mimes = config('cms-content.media_import.mimes', []);

        return is_array($mimes) ? array_map('strval', $mimes) : [];
    }
}
