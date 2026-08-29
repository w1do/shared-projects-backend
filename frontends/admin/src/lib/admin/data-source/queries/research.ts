/** Ресёрч, темы, инструкции и сборка проекта — content-service. */

import * as platformAuth from "../platform/auth";
import * as platformInstructs from "../platform/instructs";
import * as platformResearch from "../platform/research";
import type {
  PlatformBuildout,
  PlatformInstruct,
  PlatformInstructCategory,
  PlatformSchemaPreset,
  UpsertInstructBody,
} from "../platform/instructs";
import type {
  PlatformResearch,
  PlatformTopic,
  StartResearchBody,
} from "../platform/research";
import {
  PROJECT_EVENTS_LIMIT,
  mapProjectEvents,
  type ProjectEvent,
} from "../platform/project-events";

export type ProjectCard = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  topic: string | null;
  locales: string[];
};

/** Карточка проекта на дашборде: идентификатор, название, описание, тематика. */
export async function getProjectCard(): Promise<ProjectCard> {
  const project = await platformAuth.getProject();

  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description ?? null,
    topic: project.topic ?? null,
    locales: project.locales ?? [],
  } satisfies ProjectCard;
}

export async function saveProjectCard(body: {
  name?: string;
  description?: string | null;
}) {
  const project = await platformAuth.updateProject(body);

  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description ?? null,
    topic: project.topic ?? null,
    locales: project.locales ?? [],
  } satisfies ProjectCard;
}

/**
 * Последние события проекта: отказ журнала и отсутствие права не показываются
 * оператору — он их не запрашивал, панель просто остаётся без числа.
 */
export async function getProjectEvents(): Promise<ProjectEvent[]> {
  try {
    return mapProjectEvents(
      await platformAuth.listAuditEntries(PROJECT_EVENTS_LIMIT),
    );
  } catch {
    return [];
  }
}

/** Создание проекта оператором. */
export function createProject(name: string) {
  return platformAuth.createProject({ name });
}

export async function getBuildout(): Promise<PlatformBuildout | null> {
  return platformInstructs.getBuildout();
}

export function startBuildout(topic: string, overwrite = false) {
  return platformInstructs.startBuildout({ topic, overwrite });
}

export async function getResearches(
  status?: string,
): Promise<PlatformResearch[]> {
  return platformResearch.listResearches({ status });
}

export async function getResearch(
  id: number,
): Promise<PlatformResearch | null> {
  return platformResearch.getResearch(id);
}

export function startResearch(body: StartResearchBody) {
  return platformResearch.startResearch(body);
}

export function cancelResearch(id: number) {
  return platformResearch.cancelResearch(id);
}

export async function getResearchTopics(
  researchId: number,
): Promise<PlatformTopic[]> {
  return platformResearch.listResearchTopics(researchId);
}

export async function getTopics(status?: string): Promise<PlatformTopic[]> {
  return platformResearch.listTopics({ status });
}

export function extractTopics(researchId: number, maxCount?: number) {
  return platformResearch.extractTopics(researchId, maxCount);
}

export function rejectTopic(topicId: number) {
  return platformResearch.rejectTopic(topicId);
}

export function generatePostFromTopic(topicId: number) {
  return platformResearch.generatePostFromTopic(topicId);
}

export async function getInstructs(
  category?: string,
): Promise<PlatformInstruct[]> {
  return platformInstructs.listInstructs({ category });
}

export async function getInstructCategories(): Promise<
  PlatformInstructCategory[]
> {
  return platformInstructs.listInstructCategories();
}

/** Каталог пресетов схем ответа: одинаков для всех проектов. */
export async function getSchemaPresets(): Promise<PlatformSchemaPreset[]> {
  return platformInstructs.listSchemaPresets();
}

export function createInstruct(body: UpsertInstructBody) {
  return platformInstructs.createInstruct(body);
}

export function updateInstruct(id: number, body: UpsertInstructBody) {
  return platformInstructs.updateInstruct(id, body);
}

export function deleteInstruct(id: number) {
  return platformInstructs.deleteInstruct(id);
}
