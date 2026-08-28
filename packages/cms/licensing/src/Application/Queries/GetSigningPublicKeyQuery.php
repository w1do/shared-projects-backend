<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Queries;

use Cms\Licensing\Application\DTOs\SigningKey\PublicKeyDTO;
use Cms\Licensing\Domain\Contracts\LicenseSigner;
use Cms\Shared\Tenant\ProjectContext;

/**
 * Публичный ключ подписи проекта: пара создаётся лениво при первом
 * обращении (Д3); приватный ключ в ответ не попадает никогда.
 */
final class GetSigningPublicKeyQuery
{
    public function __construct(
        private readonly LicenseSigner $signer,
        private readonly ProjectContext $context,
    ) {}

    public function handle(): PublicKeyDTO
    {
        return new PublicKeyDTO(public_key: $this->signer->publicKey($this->context->required()));
    }
}
