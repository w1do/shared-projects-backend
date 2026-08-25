/**
 * Работа с деревом категорий.
 *
 * Платформа хранит категории как nested set и отдаёт вложенную структуру
 * (`children`), а таблицы и карточки вёрстки принимают плоский массив. Здесь
 * дерево раскладывается в плоский список в префиксном порядке — родитель, затем
 * всё его поддерево — с уровнем вложенности у каждого узла. Уровень нужен только
 * для оформления строки (отступ), структура остаётся в `parentId`.
 *
 * Модуль намеренно не зависит ни от типов вёрстки, ни от псевдонимов путей:
 * это чистая логика, и её проверяют юнит-тесты.
 */

export type TreeNode = {
  id: string;
  parentId?: string | null;
  children?: TreeNode[] | null;
};

export type FlatNode<T> = T & { depth: number };

/**
 * Дерево → плоский список в префиксном порядке с уровнем вложенности.
 * Порядок узлов внутри уровня сохраняется тем, в каком их отдала платформа.
 */
export function flattenTree<T extends TreeNode>(nodes: readonly T[], depth = 0): FlatNode<T>[] {
  return nodes.flatMap((node) => [
    { ...node, depth } as FlatNode<T>,
    ...flattenTree((node.children ?? []) as T[], depth + 1),
  ]);
}

/**
 * Идентификаторы всех потомков узла — по плоскому списку, без повторного обхода
 * дерева. Список уже в префиксном порядке, но опираться на это не обязательно:
 * потомки собираются по `parentId` в ширину.
 */
export function descendantIds(nodes: readonly TreeNode[], id: string): Set<string> {
  const byParent = new Map<string, string[]>();

  for (const node of nodes) {
    const parent = node.parentId ?? null;
    if (parent === null) continue;
    byParent.set(parent, [...(byParent.get(parent) ?? []), node.id]);
  }

  const found = new Set<string>();
  const queue = [...(byParent.get(id) ?? [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (found.has(current)) continue;
    found.add(current);
    queue.push(...(byParent.get(current) ?? []));
  }

  return found;
}

/**
 * Родители, которых нельзя предложить для узла: он сам и всё его поддерево.
 * Иначе оператор мог бы замкнуть дерево на себя.
 */
export function invalidParentIds(nodes: readonly TreeNode[], id: string): Set<string> {
  const invalid = descendantIds(nodes, id);
  invalid.add(id);

  return invalid;
}
