import { expect, test } from "@playwright/test";

/**
 * Ход фоновой работы в консоли: индикатор в панели, состояние рядом с темой
 * и отказ с причиной.
 *
 * Выдача реестра задаётся сценарием: запускать настоящую генерацию поста
 * значит звать ИИ, а проверяется здесь поведение консоли — что оператор видит
 * работу, не может запустить вторую такую же и узнаёт причину отказа.
 */

type TaskState = "queued" | "running" | "succeeded" | "failed";

function task(state: TaskState, stage: string | null, reason: string | null = null) {
  return {
    id: 1,
    kind: "post_generation",
    state,
    stage,
    subject_type: "topic",
    subject_id: "101",
    failure_reason: reason,
    queued_at: "2026-08-30T10:00:00+00:00",
    started_at: state === "queued" ? null : "2026-08-30T10:00:01+00:00",
    finished_at: state === "succeeded" || state === "failed" ? "2026-08-30T10:01:00+00:00" : null,
  };
}

const RESEARCH = {
  id: 55,
  query: "Автомобили 2026",
  offer: null,
  engine: "yandex",
  status: "done",
  status_label: "Завершено",
  progress_stage: "completed",
  progress_stage_label: "Готово",
  sub_queries: ["обзоры"],
  summary: "Сводка",
  error_message: null,
  sources_count: 2,
  topics_count: 1,
  started_at: "2026-08-30T09:00:00+00:00",
  completed_at: "2026-08-30T09:30:00+00:00",
  created_at: "2026-08-30T09:00:00+00:00",
  sources: [],
};

const TOPIC = {
  id: 101,
  research_id: 55,
  title: "Топ-10 седанов 2026 года",
  rationale: "В источниках есть подборки",
  category_id: null,
  suggested_category: "Седаны",
  status: "suggested",
  status_label: "Предложена",
  post_id: null,
  created_at: "2026-08-30T09:31:00+00:00",
};

/** Открыть карточку исследования: строка списка ведёт в её темы. */
async function openResearch(page: import("@playwright/test").Page) {
  await page.getByTestId("research-row-55").getByRole("button").first().click();
}

/** Выдача платформы задаётся сценарием: ресёрч, темы и состояние задач. */
async function mockResearchWorkspace(page: import("@playwright/test").Page, tasks: unknown[]) {
  await page.route("**/content/research?**", (route) =>
    route.fulfill({ json: { data: [RESEARCH] } }),
  );
  await page.route("**/content/research", (route) => route.fulfill({ json: { data: [RESEARCH] } }));
  await page.route("**/content/research/55", (route) =>
    route.fulfill({ json: { data: RESEARCH } }),
  );
  await page.route("**/content/research/55/topics**", (route) =>
    route.fulfill({ json: { data: [TOPIC] } }),
  );
  await page.route("**/content/tasks**", (route) => route.fulfill({ json: { data: tasks } }));
}

test("идущая работа видна в панели и рядом с темой, кнопка запуска недоступна", async ({
  page,
}) => {
  await mockResearchWorkspace(page, [task("running", "ai_request")]);

  await page.goto("/admin/research");
  await openResearch(page);

  await expect(page.getByTestId("topic-task-101")).toContainText("Запрос к ИИ");
  await expect(page.getByTestId("topic-write-101")).toBeDisabled();
  await expect(page.getByTestId("topbar-tasks")).toContainText("Задачи (1)");
});

test("список задач по клику показывает вид работы, предмет и этап", async ({ page }) => {
  await mockResearchWorkspace(page, [task("running", "assembling")]);

  await page.goto("/admin/research");
  await page.getByTestId("topbar-tasks").click();

  const dialog = page.getByTestId("tasks-dialog");
  await expect(dialog).toContainText("Написание поста");
  await expect(dialog).toContainText("Тема 101");
  await expect(dialog).toContainText("Сборка блоков");
  await expect(dialog).toContainText("Выполняется");
});

test("отказ показывается с причиной, тема остаётся доступной для повтора", async ({ page }) => {
  await mockResearchWorkspace(page, [
    task("failed", "ai_request", "Тема уже использована для другого поста."),
  ]);

  await page.goto("/admin/research");
  await openResearch(page);

  await expect(page.getByTestId("topic-task-failed-101")).toContainText(
    "Тема уже использована для другого поста.",
  );
  await expect(page.getByTestId("topic-write-101")).toBeEnabled();
  // Работы нет — индикатор места не занимает.
  await expect(page.getByTestId("topbar-tasks")).toHaveCount(0);
});

test("перезагрузка страницы возвращает текущее состояние задачи", async ({ page }) => {
  await mockResearchWorkspace(page, [task("running", "saving")]);

  await page.goto("/admin/research");
  await openResearch(page);
  await expect(page.getByTestId("topic-task-101")).toContainText("Сохранение");

  await page.reload();
  await openResearch(page);

  await expect(page.getByTestId("topic-task-101")).toContainText("Сохранение");
  await expect(page.getByTestId("topbar-tasks")).toContainText("Задачи (1)");
});
