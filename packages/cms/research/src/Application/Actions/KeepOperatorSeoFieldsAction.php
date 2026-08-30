<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Content\Domain\Models\SeoMeta;

/**
 * Поля, которые задаёт оператор, а не модель: адрес, robots, картинка соцсетей
 * и JSON-LD переносятся из сохранённого SEO в свежесобранное.
 */
final readonly class KeepOperatorSeoFieldsAction
{
    private const OPERATOR_FIELDS = ['canonical', 'robots', 'og_image', 'json_ld'];

    public function handle(?SeoMeta $stored, UpsertSeoDTO $fresh): UpsertSeoDTO
    {
        if ($stored === null) {
            return $fresh;
        }

        $payload = $fresh->toArray();

        foreach (self::OPERATOR_FIELDS as $field) {
            $payload[$field] = $stored->{$field};
        }

        return UpsertSeoDTO::from($payload);
    }
}
