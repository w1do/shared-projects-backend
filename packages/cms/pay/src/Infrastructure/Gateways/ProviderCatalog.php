<?php

declare(strict_types=1);

namespace Cms\Pay\Infrastructure\Gateways;

/**
 * Каталог презентационных метаданных провайдеров (Д2): дефолты group/label/name
 * для известных ключей. Подставляются в upsert-handler'е и в пустую заготовку
 * show, если оператор не передал свои; в логике платежей не участвуют.
 */
final class ProviderCatalog
{
    public const DEFAULT_GROUP = 'payments';

    /** @var array<string, array{group: string, label: string, name: string}> */
    private const METADATA = [
        'platega' => ['group' => 'payments', 'label' => 'Платёжные системы', 'name' => 'Platega'],
    ];

    /** @return array{group: string, label: ?string, name: ?string} */
    public static function metadataFor(string $provider): array
    {
        return self::METADATA[$provider]
            ?? ['group' => self::DEFAULT_GROUP, 'label' => null, 'name' => $provider];
    }
}
