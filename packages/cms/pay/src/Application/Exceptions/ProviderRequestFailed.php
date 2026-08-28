<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

use RuntimeException;
use Throwable;

/**
 * Ошибка взаимодействия со шлюзом провайдера (Д5/Д7): не валидация запроса
 * оператора, а сбой внешней системы — `CreatePaymentHandler` переводит платёж
 * в failed и фиксирует `last_error` в настройках провайдера.
 */
final class ProviderRequestFailed extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?int $status = null,
        public readonly ?string $errorCode = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function fromStatus(string $provider, int $status, ?string $errorCode = null): self
    {
        return new self("Provider [{$provider}] request failed with HTTP {$status}.", status: $status, errorCode: $errorCode);
    }

    public static function connection(string $provider, Throwable $previous): self
    {
        return new self("Provider [{$provider}] is unreachable.", previous: $previous);
    }

    public static function malformed(string $provider): self
    {
        return new self("Provider [{$provider}] returned a malformed response.");
    }

    public static function refundNotSupported(string $provider, ?string $reason = null): self
    {
        return new self("Provider [{$provider}] refund is not supported for this transaction.", errorCode: $reason);
    }
}
