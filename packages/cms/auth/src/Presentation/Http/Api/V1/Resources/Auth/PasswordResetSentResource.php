<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Auth;

use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Ответ на запрос сброса пароля. Всегда `{"sent": true}` — существование
 * аккаунта не раскрывается ни телом, ни кодом ответа.
 */
final class PasswordResetSentResource extends ApiResource
{
    public function __construct()
    {
        parent::__construct(null);
    }

    /** @return array<string, bool> */
    public function toArray(Request $request): array
    {
        return ['sent' => true];
    }
}
