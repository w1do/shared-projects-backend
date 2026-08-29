<?php

declare(strict_types=1);

namespace Cms\Research\Domain\ValueObjects;

/**
 * Запись базы знаний. Тема, запрос, содержимое, дата и категория обязательны:
 * запись без любого из них не сохраняется.
 */
final readonly class KnowledgePoint
{
    /** @param list<float> $vector */
    public function __construct(
        public string $topic,
        public string $query,
        public string $content,
        public string $category,
        public string $createdAt,
        public array $vector,
        public int $researchId,
        public ?int $sourceId = null,
        public ?string $sourceUrl = null,
        public ?string $sourceTitle = null,
    ) {}

    /** @return list<string> незаполненные обязательные поля */
    public function missingMetadata(): array
    {
        $missing = [];

        foreach (['topic', 'query', 'content', 'category', 'createdAt'] as $field) {
            if (trim((string) $this->{$field}) === '') {
                $missing[] = $field;
            }
        }

        return $missing;
    }
}
