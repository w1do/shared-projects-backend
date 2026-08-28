<?php

declare(strict_types=1);

namespace Cms\Licensing\Domain\Contracts;

/**
 * Порт подписи лицензий (Д3): Ed25519-пара проекта создаётся лениво,
 * приватный ключ не покидает хранилище. Проект указывается явно —
 * листенеры продления работают и в вебхук-джобе без проектного контекста.
 */
interface LicenseSigner
{
    /** Подпись строки приватным ключом проекта, base64. */
    public function sign(string $projectId, string $data): string;

    /** Публичный ключ проекта, base64 — для встраивания в поставку. */
    public function publicKey(string $projectId): string;
}
