/** Ресёрч, темы, инструкции и сборка проекта — фасад слоя данных для хуков. */

import * as queries from "@/lib/admin/data-source/queries/research";

export type { ProjectCard } from "@/lib/admin/data-source/queries/research";

export type {
  PlatformBuildout,
  PlatformInstruct,
  PlatformInstructCategory,
  PlatformSchemaPreset,
  PlatformSchemaPresetField,
  UpsertInstructBody,
} from "@/lib/admin/data-source/platform/instructs";

export type {
  PlatformResearch,
  PlatformResearchSource,
  PlatformTopic,
  StartResearchBody,
} from "@/lib/admin/data-source/platform/research";

export const projectCard = {
  get: queries.getProjectCard,
  save: queries.saveProjectCard,
};

export const projects = {
  create: queries.createProject,
};

export const projectBuildout = {
  get: queries.getBuildout,
  start: queries.startBuildout,
};

export const research = {
  list: queries.getResearches,
  get: queries.getResearch,
  start: queries.startResearch,
  cancel: queries.cancelResearch,
};

export const researchTopics = {
  listByResearch: queries.getResearchTopics,
  list: queries.getTopics,
  extract: queries.extractTopics,
  reject: queries.rejectTopic,
  generatePost: queries.generatePostFromTopic,
};

export const instructs = {
  list: queries.getInstructs,
  categories: queries.getInstructCategories,
  schemaPresets: queries.getSchemaPresets,
  create: queries.createInstruct,
  update: queries.updateInstruct,
  remove: queries.deleteInstruct,
};
