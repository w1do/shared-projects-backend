<?php

declare(strict_types=1);

namespace Cms\Licensing\Infrastructure\Persistence;

use Cms\Licensing\Domain\Models\SigningKey;

/**
 * Ключевая пара проекта: лениво генерируется при первой операции,
 * требующей подписи (Д3). Секрет шифруется `encrypted`-cast'ом модели
 * (Laravel Crypt), в открытом виде в БД не попадает. Проект адресуется
 * явно (`acrossProjects`): перевыпуск при оплате идёт из вебхук-джобы,
 * где проектного контекста нет.
 */
final class SigningKeyRepository
{
    public function forProject(string $projectId): SigningKey
    {
        $existing = SigningKey::acrossProjects()->where('project_id', $projectId)->first();
        if ($existing !== null) {
            return $existing;
        }

        $pair = sodium_crypto_sign_keypair();

        return SigningKey::create([
            'project_id' => $projectId,
            'public_key' => base64_encode(sodium_crypto_sign_publickey($pair)),
            'secret_key' => base64_encode(sodium_crypto_sign_secretkey($pair)),
        ]);
    }
}
