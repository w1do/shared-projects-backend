import { t, type ConsoleTextKey } from "./console-texts.ts";
import type { PlatformTask } from "./data-source/platform/tasks.ts";

/**
 * Подписи фоновой задачи для оператора. Ключи платформы (вид работы, этап,
 * предмет) переводятся здесь: незнакомый ключ показывается как есть, а не
 * пустой строкой — оператор должен что-то видеть даже про новый вид работы.
 */
function label(key: string, fallback: string): string {
  const text = t(key as ConsoleTextKey);

  return text === key ? fallback : text;
}

export function taskKindLabel(kind: string): string {
  return label(`console.tasks.kind.${kind}`, kind);
}

export function taskStateLabel(state: PlatformTask["state"]): string {
  return t(`console.tasks.state.${state}`);
}

export function taskStageLabel(stage: string | null): string | null {
  return stage === null ? null : label(`console.tasks.stage.${stage}`, stage);
}

/** Предмет работы: «Тема 7», «Исследование 3». Без предмета — прочерк. */
export function taskSubjectLabel(task: PlatformTask): string {
  if (!task.subject_type) return "—";

  const subject = label(
    `console.tasks.subject.${task.subject_type}`,
    task.subject_type,
  );

  return task.subject_id ? `${subject} ${task.subject_id}` : subject;
}
