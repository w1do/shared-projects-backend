/**
 * Типы пакета `markdown-text-editor`: он их не поставляет.
 *
 * Редактор навешивается на существующий `<textarea>` и не подменяет его —
 * значение читается и пишется через нативный элемент, а `destroy()` снимает
 * обвязку при размонтировании.
 */
declare module "markdown-text-editor" {
  export default class MarkdownEditor {
    constructor(target: string | HTMLTextAreaElement, options?: Record<string, unknown>);

    destroy(): void;
  }
}
