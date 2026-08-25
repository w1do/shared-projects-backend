<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\User;

use Cms\Shared\Http\Resources\ApiCursorCollection;

/** Курсорная страница пользователей сайта проекта. */
final class SiteUserCollection extends ApiCursorCollection
{
    /** @var class-string */
    public $collects = SiteUserModelResource::class;
}
