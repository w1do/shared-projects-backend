<?php

declare(strict_types=1);

namespace Cms\Shared\Testing;

use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Assert;
use RuntimeException;
use stdClass;

/**
 * Характеризационные снимки HTTP-ответов: фиксируют текущий контракт
 * (статус, content-type, форму и типы тела) до рефакторинга.
 *
 * Недетерминированные значения маскируются типом (`<int>`, `<datetime>`),
 * поэтому снимок ловит изменение ключей, вложенности, типов и литералов
 * (кодов ошибок, сообщений, enum-значений), но не зависит от прогона.
 *
 * Снимок записывается при первом прогоне в `<каталог теста>/__snapshots__/<name>.json`
 * и с этого момента сравнивается. Расхождение — сигнал, что контракт изменился.
 */
final class ResponseSnapshot
{
    /** Ключи, значения которых меняются от прогона к прогону. */
    private const VOLATILE_KEYS = [
        'trace_id',
        'token',
        'plain',
        'plain_text_token',
        'next_cursor',
        'prev_cursor',
        'cursor',
        'checksum',
        'signature',
    ];

    /** Ключи-идентификаторы: значение маскируется, тип сохраняется. */
    private const ID_KEY_PATTERN = '/(^id$|_id$|^uuid$|_uuid$|^ulid$)/';

    /** Ключи-отметки времени. */
    private const TIMESTAMP_KEY_PATTERN = '/(_at$|^date$|_date$|^from$|^to$)/';

    public static function assertMatches(TestResponse $response, string $name): void
    {
        $file = self::resolvePath($name);
        $actual = self::normalize($response);

        if (! is_file($file)) {
            // В CI запись запрещена: иначе потерянный каталог __snapshots__ превращает
            // всю защиту в «всегда зелено» ровно тогда, когда она нужна.
            if (self::strict()) {
                Assert::fail(
                    "Снимок отсутствует: {$name}\nОжидался файл: {$file}\n"
                    .'В строгом режиме снимки не записываются — закоммить каталог __snapshots__.',
                );
            }

            self::write($file, $actual);
            Assert::assertFileExists($file, "Снимок не удалось записать: {$name}");

            return;
        }

        $expected = (string) file_get_contents($file);

        Assert::assertSame(
            $expected,
            $actual,
            "Контракт ответа изменился: {$name}\nСнимок: {$file}\n"
            .'Если изменение намеренное — обнови снимок осознанно, удалив файл и перезаписав его.',
        );
    }

    /** Нормализованное представление ответа: статус, content-type, тело. */
    private static function normalize(TestResponse $response): string
    {
        $contentType = (string) $response->headers->get('content-type');
        $body = $response->getContent();
        $body = $body === false ? '' : $body;

        $payload = [
            'status' => $response->getStatusCode(),
            'content_type' => self::normalizeContentType($contentType),
        ];

        if (str_contains($contentType, 'json') && $body !== '') {
            $decoded = json_decode($body, false, 512, JSON_THROW_ON_ERROR);
            $payload['body'] = self::mask($decoded, null);
        } elseif ($body === '') {
            $payload['body'] = null;
        } else {
            $payload['body'] = self::maskText($body);
        }

        return json_encode(
            $payload,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
        )."\n";
    }

    private static function normalizeContentType(string $contentType): string
    {
        return trim(explode(';', $contentType)[0]);
    }

    /**
     * Рекурсивно маскирует недетерминированные значения, сохраняя ключи,
     * порядок, вложенность, различие «пустой объект» / «пустой массив» и типы.
     */
    private static function mask(mixed $value, ?string $key): mixed
    {
        if ($value instanceof stdClass) {
            $result = new stdClass;
            foreach (get_object_vars($value) as $childKey => $childValue) {
                $result->{$childKey} = self::mask($childValue, $childKey);
            }

            return $result;
        }

        if (is_array($value)) {
            return array_map(static fn (mixed $item): mixed => self::mask($item, $key), $value);
        }

        if ($value === null || is_bool($value)) {
            return $value;
        }

        if ($key !== null && in_array($key, self::VOLATILE_KEYS, true)) {
            return self::typeTag($value);
        }

        if ($key !== null && preg_match(self::ID_KEY_PATTERN, $key) === 1) {
            return self::typeTag($value);
        }

        if ($key !== null && preg_match(self::TIMESTAMP_KEY_PATTERN, $key) === 1) {
            return self::typeTag($value);
        }

        if (is_string($value) && self::looksVolatile($value)) {
            return self::typeTag($value);
        }

        return $value;
    }

    private static function typeTag(mixed $value): string
    {
        return match (true) {
            is_int($value) => '<int>',
            is_float($value) => '<float>',
            is_string($value) => '<string>',
            default => '<'.gettype($value).'>',
        };
    }

    /**
     * Строки, недетерминированные по своей природе: даты, ULID/UUID,
     * sanctum-токены, а также секретоподобные значения (полные API-ключи) —
     * последние маскируются ещё и потому, что secret-сканеры (GitHub Push
     * Protection) принимают их за настоящие ключи; формат фиксируется
     * полем `prefix`, которое остаётся в снимке литералом.
     */
    private static function looksVolatile(string $value): bool
    {
        $patterns = [
            '/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/',
            '/^[0-9A-HJKMNP-TV-Z]{26}$/',
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            '/^\d+\|[A-Za-z0-9]{20,}$/',
            '/^(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}$/',
            '/^LIC(-[0-9A-HJKMNP-TV-Z]{5}){5}$/', // активационные ключи лицензий
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $value) === 1) {
                return true;
            }
        }

        return false;
    }

    /** Для не-JSON ответов (sitemap.xml, robots.txt) маскируются даты и абсолютные хосты. */
    private static function maskText(string $body): string
    {
        $body = (string) preg_replace('/\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}\S*)?/', '<datetime>', $body);

        return trim($body);
    }

    private static function resolvePath(string $name): string
    {
        $dir = self::callerDirectory();
        $path = $dir.'/__snapshots__/'.$name.'.json';
        $parent = dirname($path);

        if (! is_dir($parent) && ! mkdir($parent, 0o777, true) && ! is_dir($parent)) {
            throw new RuntimeException("Не удалось создать каталог снимков: {$parent}");
        }

        return $path;
    }

    /** Каталог тестового файла, из которого вызван снимок. */
    private static function callerDirectory(): string
    {
        foreach (debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS) as $frame) {
            $file = $frame['file'] ?? null;
            if (is_string($file) && str_ends_with($file, 'Test.php')) {
                return dirname($file);
            }
        }

        throw new RuntimeException('Не удалось определить тестовый файл для снимка ответа.');
    }

    private static function write(string $file, string $contents): void
    {
        file_put_contents($file, $contents);
    }

    /** Строгий режим: CI=1 либо SNAPSHOT_STRICT=1 — отсутствующий снимок валит тест. */
    private static function strict(): bool
    {
        foreach (['SNAPSHOT_STRICT', 'CI'] as $name) {
            $value = getenv($name);
            if ($value !== false && $value !== '' && $value !== '0' && $value !== 'false') {
                return true;
            }
        }

        return false;
    }
}
