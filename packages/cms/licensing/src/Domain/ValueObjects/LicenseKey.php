<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\ValueObjects;

/**
 * Активационный ключ `LIC-XXXX-XXXX-XXXX-XXXX` (Д3): каноническая форма —
 * верхний регистр без пробелов; в хранилище только sha256-хэш и префикс.
 */
final readonly class LicenseKey
{
    public const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    private function __construct(public string $normalized) {}

    public static function fromInput(string $key): self
    {
        return new self(strtoupper(trim($key)));
    }

    public function hash(): string
    {
        return hash('sha256', $this->normalized);
    }

    /** Префикс для поиска в админке: первая группа с маркером (`LIC-XXXX`). */
    public function prefix(): string
    {
        return substr($this->normalized, 0, 8);
    }
}
