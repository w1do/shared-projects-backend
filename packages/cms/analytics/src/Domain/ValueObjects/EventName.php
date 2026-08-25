<?php

declare(strict_types=1);

namespace Cms\Analytics\Domain\ValueObjects;

/**
 * Имя события.
 *
 * Регулярка — ЕДИНСТВЕННОЕ ограничение имени (Safety Protocol, И16): имена
 * собираются в рантайме (`payment.{$status}`, `content.{$kind}.published`,
 * произвольные события сайта), поэтому список `Domain\Enums\EventType` —
 * справочник для отчётов, а не белый список приёма.
 *
 * Событие с недопустимым именем молча отбрасывается, ответ остаётся 202 (п. Б5).
 */
final readonly class EventName
{
    private const PATTERN = '/^[a-z0-9_.]+$/';

    private function __construct(public string $value) {}

    /** Возвращает null, если имя пустое или не проходит регулярку. */
    public static function tryFrom(mixed $raw): ?self
    {
        $name = (string) ($raw ?? '');

        if ($name === '' || preg_match(self::PATTERN, $name) !== 1) {
            return null;
        }

        return new self($name);
    }
}
