<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/** Кто выполнил действие в журнале аудита. */
enum ActorType: string
{
    case Admin = 'admin';
    case Service = 'service';
    case System = 'system';
}
