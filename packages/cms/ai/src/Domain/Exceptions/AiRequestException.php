<?php

declare(strict_types=1);

namespace Cms\Ai\Domain\Exceptions;

use Throwable;

/** Отказ провайдера: сеть, авторизация, лимиты, таймаут. Ключ в сообщение не попадает. */
class AiRequestException extends AiException
{
    public static function wrap(Throwable $error): self
    {
        return new self('AI provider request failed: '.$error->getMessage(), previous: $error);
    }
}
