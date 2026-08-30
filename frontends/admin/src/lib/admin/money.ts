/**
 * Деньги платформы приходят целыми минорными единицами: 19900 RUB — это
 * 199,00 ₽. Форматирование живёт здесь, чтобы копейки не терялись делением
 * по месту вызова.
 */

/** Валюты без минорных единиц: у них сумма и есть целое число. */
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND"]);

export function minorToMajor(amountMinor: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase())
    ? amountMinor
    : amountMinor / 100;
}

export function majorToMinor(amountMajor: number, currency: string): number {
  return Math.round(
    ZERO_DECIMAL.has(currency.toUpperCase()) ? amountMajor : amountMajor * 100,
  );
}

/** Сумма для оператора: «199,00 RUB». Локаль — русская, как и вся консоль. */
export function formatMinor(amountMinor: number, currency: string): string {
  const fractionDigits = ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2;
  const amount = minorToMajor(amountMinor, currency).toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return `${amount} ${currency.toUpperCase()}`;
}
