/**
 * Ресёрч, темы, инструкции и сборка проекта.
 *
 * Разделы существуют только в режиме `api`: демо-данных у них нет, поэтому в
 * mock-режиме возвращается пустой результат, а не выдуманные записи.
 */

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
import { fromSource } from "./shared";

export type ProjectCard = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  topic: string | null;
  locales: string[];
};

const emptyProjectCard: ProjectCard = {
  id: "",
  key: "",
  name: "",
  description: null,
  topic: null,
  locales: [],
};

/** Карточка проекта на дашборде: идентификатор, название, описание, тематика. */
export async function getProjectCard(): Promise<ProjectCard> {
  return fromSource(async () => {
    const project = await platformAuth.getProject();

    return {
      id: project.id,
      key: project.key,
      name: project.name,
      description: project.description ?? null,
      topic: project.topic ?? null,
      locales: project.locales ?? [],
    } satisfies ProjectCard;
  }, emptyProjectCard);
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

/** Создание проекта оператором: в mock-режиме платформы нет, поэтому только api. */
export function createProject(name: string) {
  return platformAuth.createProject({ name });
}

export async function getBuildout(): Promise<PlatformBuildout | null> {
  return fromSource(() => platformInstructs.getBuildout(), null);
}

export function startBuildout(topic: string, overwrite = false) {
  return platformInstructs.startBuildout({ topic, overwrite });
}

export async function getResearches(
  status?: string,
): Promise<PlatformResearch[]> {
  return fromSource(() => platformResearch.listResearches({ status }), []);
}

export async function getResearch(
  id: number,
): Promise<PlatformResearch | null> {
  return fromSource(() => platformResearch.getResearch(id), null);
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
  return fromSource(() => platformResearch.listResearchTopics(researchId), []);
}

export async function getTopics(status?: string): Promise<PlatformTopic[]> {
  return fromSource(() => platformResearch.listTopics({ status }), []);
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
  return fromSource(() => platformInstructs.listInstructs({ category }), []);
}

export async function getInstructCategories(): Promise<
  PlatformInstructCategory[]
> {
  return fromSource(() => platformInstructs.listInstructCategories(), []);
}

/** Каталог пресетов схем ответа: одинаков для всех проектов. */
export async function getSchemaPresets(): Promise<PlatformSchemaPreset[]> {
  return fromSource(() => platformInstructs.listSchemaPresets(), []);
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
