<?php

declare(strict_types=1);

namespace Cms\Shared\AuthClient;

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
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
     * user_key пользователя сайта из заголовка X-User-Token:
     * токен интроспектируется и сверяется с проектом текущего запроса.
     * Формат ключа — контракт хранения подписок: `user:{projectId}:{userId}`.
     */
    public function siteUserKey(Request $request): ?string
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

        return "user:{$result->projectId}:{$result->userId}";
    }
}
