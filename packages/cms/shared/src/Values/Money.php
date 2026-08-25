<?php

declare(strict_types=1);

namespace Cms\Shared\Values;

use InvalidArgumentException;
use JsonSerializable;

/**
 * Деньги — только целые минорные единицы. Float не появляется нигде:
 * ни в конструкторе, ни в сериализации, ни в арифметике.
 */
final readonly class Money implements JsonSerializable
{
    public function __construct(
        public int $amountMinor,
        public Currency $currency,
    ) {}

    public static function of(int $amountMinor, string $currency): self
    {
        return new self($amountMinor, new Currency($currency));
    }

    public function add(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->amountMinor + $other->amountMinor, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->amountMinor - $other->amountMinor, $this->currency);
    }

    public function isNegative(): bool
    {
        return $this->amountMinor < 0;
    }

    public function isZero(): bool
    {
        return $this->amountMinor === 0;
    }

    public function jsonSerialize(): array
    {
        return [
            'amount_minor' => $this->amountMinor,
            'currency' => $this->currency->code,
        ];
    }

    private function assertSameCurrency(self $other): void
    {
        if (! $this->currency->equals($other->currency)) {
            throw new InvalidArgumentException(
                "Currency mismatch: {$this->currency->code} vs {$other->currency->code}."
            );
        }
    }
}
