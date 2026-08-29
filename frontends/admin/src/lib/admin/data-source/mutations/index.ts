import { catalogMutations } from "./catalog";
import { contentMutations } from "./content";
import { operationsMutations } from "./operations";

export const adminMutations = {
  ...catalogMutations,
  ...operationsMutations,
  ...contentMutations,
};
