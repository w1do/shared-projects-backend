<?php

declare(strict_types=1);

namespace Cms\Content\Domain\Contracts;

/** Порт разрешения имени в адреса: проверка на приватные диапазоны идёт по ним. */
interface HostResolver
{
    /** @return list<string> IPv4/IPv6-адреса имени; пустой список — имя не разрешено */
    public function addresses(string $host): array;
}
