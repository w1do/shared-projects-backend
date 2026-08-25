<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\LogoutCommand;

/**
 * Выход: удаляется ровно текущий токен доступа, остальные сессии субъекта живут.
 * Общий для оператора и пользователя сайта — операция дословно одна и та же.
 */
final class LogoutHandler
{
    public function handle(LogoutCommand $command): void
    {
        $command->subject->currentAccessToken()->delete();
    }
}
