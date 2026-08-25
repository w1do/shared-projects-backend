import { catalogMutations } from "./catalog";
import { productMutations } from "./catalog-products";
import { contentMutations } from "./content";
import { operationsMutations } from "./operations";

export const adminMutations = {
  ...catalogMutations,
  ...productMutations,
  ...operationsMutations,
  ...contentMutations,
};
