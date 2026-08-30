<?php

declare(strict_types=1);

namespace Cms\Content\Infrastructure\Persistence;

use Cms\Content\Application\Exceptions\ContentRuleViolation;
use Cms\Content\Domain\Contracts\CityDirectorySource;
use Cms\Content\Domain\ValueObjects\CityRecord;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Источник справочника в формате arbaev/russia-cities. Без аргумента читается
 * поставляемая копия: бутстрап стека не зависит от доступности сети.
 */
final readonly class JsonCityDirectorySource implements CityDirectorySource
{
    public function __construct(private Config $config) {}

    /** @return list<CityRecord> */
    public function read(?string $source = null): array
    {
        $source ??= (string) $this->config->get('cms-content.city_directory_path');

        $decoded = json_decode($this->contents($source), true);

        if (! is_array($decoded)) {
            throw ContentRuleViolation::cityDirectoryUnreadable($source);
        }

        $records = [];

        foreach ($decoded as $row) {
            if (is_array($row) && is_array($row['region'] ?? null) && is_string($row['name'] ?? null)) {
                $records[] = $this->record($row, $row['region']);
            }
        }

        return $records;
    }

    private function contents(string $source): string
    {
        if (str_starts_with($source, 'http://') || str_starts_with($source, 'https://')) {
            try {
                return Http::timeout(60)->get($source)->throw()->body();
            } catch (Throwable) {
                throw ContentRuleViolation::cityDirectoryUnreadable($source);
            }
        }

        $contents = is_file($source) ? file_get_contents($source) : false;

        return $contents === false ? throw ContentRuleViolation::cityDirectoryUnreadable($source) : $contents;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, mixed>  $region
     */
    private function record(array $row, array $region): CityRecord
    {
        $coords = is_array($row['coords'] ?? null) ? $row['coords'] : [];

        return new CityRecord(
            regionName: $this->text($region, 'fullname') ?? $this->text($region, 'name') ?? 'Не указан',
            federalDistrict: $this->text($region, 'district'),
            name: (string) $row['name'],
            slug: $this->text($row, 'label'),
            population: (int) ($row['population'] ?? 0),
            latitude: isset($coords['lat']) ? (float) $coords['lat'] : null,
            longitude: isset($coords['lon']) ? (float) $coords['lon'] : null,
        );
    }

    /** @param  array<string, mixed>  $source */
    private function text(array $source, string $key): ?string
    {
        $value = $source[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
