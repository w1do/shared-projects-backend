<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Middleware;

use Closure;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Публичное /api/v1/auth/*: проект резолвится из API-ключа сайта
 * (X-Api-Key или X-Project-Key). Внутри auth-service ключ проверяется локально.
 */
final class ResolveSiteProject
{
    public function __construct(private readonly ProjectContext $context) {}

    public function handle(Request $request, Closure $next): Response
    {
        $plain = $request->header('X-Api-Key') ?? $request->header('X-Project-Key');
        if (! is_string($plain) || $plain === '') {
            return ErrorEnvelope::unauthorized('Project API key is required.');
        }

        $key = ProjectApiKey::findByPlainKey($plain);
        if ($key === null || $key->isRevoked() || $key->project?->isArchived()) {
            return ErrorEnvelope::unauthorized('Invalid project API key.');
        }

        $key->forceFill(['last_used_at' => now()])->saveQuietly();

        $this->context->set($key->project_id);
        $request->attributes->set('project_id', $key->project_id);

        return $next($request);
    }
}
