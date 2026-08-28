<?php

declare(strict_types=1);

namespace Cms\Pay\Domain\Contracts;

use Illuminate\Http\Request;

/**
 * Отложенная верификация callback (Д6): на фазе приёма проект неизвестен,
 * поэтому адаптер снимает слепок авторизации запроса, а подлинность
 * проверяется в конвейере обработки — после резолва платежа, уже с
 * пер-проектными credentials. Секрет в слепке хранится только как SHA-256.
 */
interface DeferredWebhookAuth
{
    /** @return array<string, string> */
    public function webhookAuthSnapshot(Request $request): array;

    /** @param  array<string, mixed>|null  $auth */
    public function verifyWebhookAuth(?array $auth): bool;
}
