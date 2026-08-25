<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure;

use Cms\Shared\AuthClient\AuthClient;
use Illuminate\Contracts\Cache\Repository as CacheRepository;
use Psr\Log\LoggerInterface;
use Throwable;

/**
 * Версия словаря проекта: растёт при любой записи. Панель сравнивает её с
 * `translations_version` из bootstrap и перезагружает словарь при росте;
 * auth уведомляется best-effort — потерянное уведомление догонит следующее.
 *
 * Уведомление auth остаётся СИНХРОННЫМ: «версия у auth обновлена до ответа» —
 * наблюдаемый контракт панели, перенос в очередь его меняет (Safety Protocol, И9).
 */
final class TranslationsVersion
{
    public function __construct(
        private readonly AuthClient $auth,
        private readonly CacheRepository $cache,
        private readonly LoggerInterface $log,
    ) {}

    public function current(string $projectId): int
    {
        return (int) $this->cache->get("translations:version:{$projectId}", 1);
    }

    public function bump(string $projectId): int
    {
        $version = $this->current($projectId) + 1;
        $this->cache->forever("translations:version:{$projectId}", $version);

        try {
            $this->auth->bumpTranslationsVersion($projectId, $version);
        } catch (Throwable $error) {
            $this->log->warning('translations version notify failed', ['project' => $projectId, 'error' => $error->getMessage()]);
        }

        return $version;
    }
}
