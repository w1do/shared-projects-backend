<?php

declare(strict_types=1);

namespace Cms\Shared\Billing;

use Cms\Shared\Values\Money;
use DateInterval;

/**
 * Предмет подписки: сущность, на которую можно оформить подписку.
 * Реализуется тарифным планом биллинга и лицензионным планом поставки;
 * renewal-цикл работает только через этот контракт, не через конкретную модель.
 */
interface Subscribable
{
    /** Цена одного оплачиваемого периода. */
    public function subscriptionPrice(): Money;

    /** Длительность оплачиваемого периода. */
    public function subscriptionInterval(): DateInterval;

    /** Машинный код предмета (идёт в props аналитики и описания платежей). */
    public function subscriptionCode(): string;

    /** Отображаемое имя предмета. */
    public function subscriptionName(): string;
}
