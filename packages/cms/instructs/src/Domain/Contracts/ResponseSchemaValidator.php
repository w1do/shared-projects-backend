<?php

declare(strict_types=1);

namespace Cms\Instructs\Domain\Contracts;

/**
 * Порт проверки схемы ответа: пригодность схемы знает тот, кто её исполняет,
 * а не пакет инструкций.
 */
interface ResponseSchemaValidator
{
    /**
     * @param  array<string, mixed>  $schema
     * @return string|null причина отказа или null, если схема пригодна
     */
    public function rejectionReason(array $schema): ?string;
}
