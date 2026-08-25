<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\Auth;

use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/** Ответ на успешный сброс пароля. */
final class PasswordResetDoneResource extends ApiResource
{
    public function __construct()
    {
        parent::__construct(null);
    }

    /** @return array<string, bool> */
    public function toArray(Request $request): array
    {
        return ['reset' => true];
    }
}
