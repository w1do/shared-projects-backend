<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient;

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Shared\Billing\Subscriber;
use Illuminate\Http\Request;

/**
 * Единая точка чтения introspection-контекста запроса.
 *
 * Заменяет разрозненные приватные хелперы контроллеров:
 * `actorId()` (content), `userKey()` (pay) — данные берутся из атрибутов,
 * положенных middleware `AuthorizeOperator`/`AuthorizeProjectKey`.
 */
final class RequestIntrospection
{
    public function __construct(private readonly Introspector $introspector) {}

    /** Результат интроспекции текущего запроса (кладётся middleware). */
    public function result(Request $request): ?IntrospectionResult
    {
        $result = $request->attributes->get('introspection');

        return $result instanceof IntrospectionResult ? $result : null;
    }

    /** Идентификатор оператора, выполняющего запрос (для аудита/ревизий). */
    public function actorId(Request $request): ?string
    {
        return $this->result($request)?->userId;
    }

    /**
     * Субъект-ключ аналитики пользователя сайта из заголовка X-User-Token.
     * Формат `user:{projectId}:{userId}` — непрерывность истории ClickHouse.
     */
    public function siteUserKey(Request $request): ?string
    {
        $result = $this->siteUser($request);

        return $result === null ? null : "user:{$result->projectId}:{$result->userId}";
    }

    /**
     * Полиморфный подписчик текущего пользователя сайта:
     * `Subscriber('site_user', userId)` из той же интроспекции X-User-Token.
     */
    public function siteSubscriber(Request $request): ?Subscriber
    {
        $result = $this->siteUser($request);

        return $result?->userId === null ? null : Subscriber::siteUser($result->userId);
    }

    /**
     * Интроспекция X-User-Token: активный пользователь сайта,
     * сверенный с проектом текущего запроса.
     */
    private function siteUser(Request $request): ?IntrospectionResult
    {
        $token = $request->header('X-User-Token');
        if (! is_string($token) || $token === '') {
            return null;
        }

        $result = $this->introspector->token($token);
        $projectId = $this->result($request)?->projectId;

        if (! $result->active || $result->subject !== Subject::ProjectUser || $result->projectId !== $projectId) {
            return null;
        }

        return $result;
    }
}
