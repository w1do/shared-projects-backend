<?php

declare(strict_types=1);

namespace Cms\Localization\Domain\Contracts;

use Cms\Localization\Domain\ValueObjects\TranslatableSubject;

/**
 * Порт предметов автоперевода за пределами словаря (имена категорий и т. п.).
 *
 * Реализации живут в пакетах-владельцах данных и регистрируются их
 * провайдерами: зависимость направлена «владелец → localization», словарь о
 * чужих моделях и таблицах не знает.
 */
interface TranslatableSubjectRepository
{
    /** Имя предмета в API автоперевода (`subject`), например `categories`. */
    public function subject(): string;

    /**
     * Все предметы текущего проекта с уже имеющимися переводами.
     *
     * @return iterable<int, TranslatableSubject>
     */
    public function all(): iterable;

    /**
     * Записать переводы и пометить их машинными. Владелец сам отвечает за
     * транзакцию: частично применённых переводов предмета быть не должно.
     *
     * @param  array<string, string>  $values  локаль → значение
     */
    public function applyMachineTranslations(int|string $id, array $values): void;
}
