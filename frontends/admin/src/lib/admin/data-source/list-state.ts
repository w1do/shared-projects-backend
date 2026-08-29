/**
 * Состояние списка раздела, пока данные ещё идут.
 *
 * Подключённые разделы отрисовываются сразу, без промежуточного скелетона,
 * поэтому пустой список на первом кадре неотличим от «записей нет». Правило
 * одно на все разделы: пока идёт загрузка, показывается текст загрузки, и
 * только после прихода данных — пустое состояние.
 *
 * Чистая функция без зависимостей — покрыта node-тестом.
 */
export function listStateMessage(
  isLoading: boolean,
  loadingText: string,
  emptyText: string,
): string {
  return isLoading ? loadingText : emptyText;
}

/** Пустое состояние показывается только после того, как данные пришли. */
export function showsEmptyState(isLoading: boolean, itemCount: number): boolean {
  return !isLoading && itemCount === 0;
}
