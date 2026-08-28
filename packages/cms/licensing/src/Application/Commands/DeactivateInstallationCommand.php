<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Commands;

/**
 * Клиентская деактивация установки при переезде (Д7): слот лимита
 * освобождается, повторная активация идёт с новым `install_id`.
 */
final readonly class DeactivateInstallationCommand
{
    public function __construct(
        public string $key,
        public string $installId,
    ) {}
}
