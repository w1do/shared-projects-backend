<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Persistence;

use Cms\Localization\Domain\Contracts\TranslatableSubjectRepository;

/**
 * Реестр адаптеров порта: пакеты-владельцы данных помечают свои реализации
 * тегом контейнера, localization собирает их отсюда, не зная имён классов.
 */
final readonly class TranslatableSubjectRegistry
{
    public const TAG = 'cms.localization.translatable-subjects';

    /** @param list<TranslatableSubjectRepository> $repositories */
    public function __construct(private array $repositories = []) {}

    /**
     * Адаптеры запрошенного предмета; null — все зарегистрированные.
     *
     * @return list<TranslatableSubjectRepository>
     */
    public function matching(?string $subject): array
    {
        return array_values(array_filter(
            $this->repositories,
            fn (TranslatableSubjectRepository $repository): bool => $subject === null || $repository->subject() === $subject,
        ));
    }
}
