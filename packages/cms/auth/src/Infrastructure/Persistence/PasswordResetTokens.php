<?php

declare(strict_types=1);

namespace Cms\Auth\Infrastructure\Persistence;

use Cms\Auth\Domain\Enums\Guard;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Str;

/**
 * Одноразовые токены сброса пароля — общие для оператора и пользователя сайта.
 *
 * Различие ровно одно: у токена сайта есть проект, у операторского его нет,
 * поэтому фильтр по проекту добавляется только когда проект передан. Ключ
 * перезаписи — пара (email, guard), как и было: второй запрос сброса заменяет
 * предыдущий токен, а не заводит второй.
 */
final class PasswordResetTokens
{
    public function __construct(
        private readonly DatabaseManager $db,
        private readonly Config $config,
    ) {}

    /**
     * Выпускает одноразовый токен и возвращает его plain-значение для доставки.
     * В БД хранится только sha256-хэш — plain существует лишь в момент выпуска.
     */
    public function issue(string $email, Guard $guard, ?string $projectId): string
    {
        $plain = Str::random(64);

        $this->db->table('password_reset_tokens')->updateOrInsert(
            ['email' => $email, 'guard' => $guard->value],
            ['token' => hash('sha256', $plain), 'created_at' => now(), 'project_id' => $projectId],
        );

        return $plain;
    }

    /** Токен предъявлен верно и не истёк. */
    public function matches(string $email, Guard $guard, ?string $projectId, string $plainToken): bool
    {
        $row = $this->query($email, $guard, $projectId)->first();

        if ($row === null) {
            return false;
        }

        $ttl = (int) $this->config->get('cms-auth.reset_token_ttl', 60);

        return hash_equals((string) $row->token, hash('sha256', $plainToken))
            && now()->diffInMinutes($row->created_at) <= $ttl;
    }

    /** Одноразовость: использованный токен исчезает. */
    public function forget(string $email, Guard $guard, ?string $projectId): void
    {
        $this->query($email, $guard, $projectId)->delete();
    }

    private function query(string $email, Guard $guard, ?string $projectId): Builder
    {
        $query = $this->db->table('password_reset_tokens')
            ->where('email', $email)
            ->where('guard', $guard->value);

        if ($projectId !== null) {
            $query->where('project_id', $projectId);
        }

        return $query;
    }
}
