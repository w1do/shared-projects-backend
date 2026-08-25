<?php

declare(strict_types=1);

namespace Cms\Contracts\Introspection;

enum Subject: string
{
    case Admin = 'admin';
    case ProjectUser = 'project_user';
    case ApiKey = 'api_key';
    case Invalid = 'invalid';
}
