<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

use Cms\Shared\Http\ErrorEnvelope;
use Illuminate\Http\JsonResponse;

/**
 * Ошибки публичного активационного контракта (ТЗ 1.7 / Д6): машинный код
 * в `error.code` стандартного envelope, русский `message` для показа клиенту.
 */
final class LicenseActivationError extends \RuntimeException
{
    private function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly int $status,
    ) {
        parent::__construct($message);
    }

    public static function licenseNotFound(): self
    {
        return new self('license_not_found', 'Лицензия с таким ключом не найдена.', 404);
    }

    public static function unknownInstallation(): self
    {
        return new self('unknown_installation', 'Установка неизвестна или отозвана.', 404);
    }

    public static function licenseRevoked(): self
    {
        return new self('license_revoked', 'Лицензия отозвана.', 403);
    }

    public static function installationLimitReached(): self
    {
        return new self('installation_limit_reached', 'Достигнут лимит установок по лицензии.', 409);
    }

    public function render(): JsonResponse
    {
        return ErrorEnvelope::respond($this->errorCode, $this->getMessage(), $this->status);
    }
}
