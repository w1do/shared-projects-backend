<?php

declare(strict_types=1);

namespace Cms\Ai\Application\Exceptions;

use Throwable;

/** Схема ответа, переданная потребителем, непригодна: отказ до обращения к провайдеру. */
final class AiSchemaException extends AiException
{
    public static function wrap(Throwable $error): self
    {
        return new self('AI response schema is not supported: '.$error->getMessage(), previous: $error);
    }
}
