<?php

declare(strict_types=1);
use Cms\Licensing\Domain\Models\SigningKey;

/*
 * Общие помощники тестов licensing. Оператор — через FakePayIntrospector
 * из pay/tests/Helpers.php (пакеты живут в одном pay-service).
 */

function licensingOperator(array $permissions = ['pay.licensing.view', 'pay.licensing.manage']): array
{
    return actingAsPayOperator(permissions: $permissions);
}

function licensingUrl(string $path): string
{
    return "/api/admin/v1/projects/proj-1/pay/licensing/{$path}";
}

/** @return array{payload: string, signature: string} сырые байты частей токена */
function licensingSplitToken(string $token): array
{
    [$payload, $signature] = explode('.', $token);

    return [
        'payload' => (string) base64_decode(strtr($payload, '-_', '+/'), true),
        'signature' => (string) base64_decode(strtr($signature, '-_', '+/'), true),
    ];
}

/**
 * Проверка токена «чистым» sodium по публичному ключу проекта
 * и разбор payload — без кода выпуска (риски Д4).
 *
 * @return array<string, mixed>
 */
function licensingVerifyToken(string $token, string $projectId = 'proj-1'): array
{
    $parts = licensingSplitToken($token);
    $publicKey = (string) base64_decode(
        SigningKey::acrossProjects()->where('project_id', $projectId)->sole()->public_key,
        true,
    );

    expect(sodium_crypto_sign_verify_detached($parts['signature'], $parts['payload'], $publicKey))->toBeTrue();

    return (array) json_decode($parts['payload'], true);
}
