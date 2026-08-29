<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Http;

use Cms\Content\Domain\Contracts\HostResolver;

/** Разрешение имени системным резолвером: A- и AAAA-записи. */
final class DnsHostResolver implements HostResolver
{
    /** @return list<string> */
    public function addresses(string $host): array
    {
        $addresses = gethostbynamel($host) ?: [];

        $records = @dns_get_record($host, DNS_AAAA) ?: [];
        foreach ($records as $record) {
            if (isset($record['ipv6']) && is_string($record['ipv6'])) {
                $addresses[] = $record['ipv6'];
            }
        }

        return array_values(array_unique($addresses));
    }
}
