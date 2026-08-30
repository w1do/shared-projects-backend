<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Enums;

/** Вид сайта проекта: от него зависит состав разделов витрины. */
enum ProjectType: string
{
    case Blog = 'blog';
    case Shop = 'shop';
    case Corporate = 'corporate';
    case Landing = 'landing';

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $type): string => $type->value, self::cases());
    }
}
