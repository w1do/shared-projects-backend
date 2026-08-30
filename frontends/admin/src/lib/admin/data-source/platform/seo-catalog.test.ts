import assert from "node:assert/strict";
import { test } from "node:test";

import { seoCatalogPath, seoRebuildPath } from "./seo-catalog-paths.ts";

test("путь каталога SEO несёт отбор, сортировку и курсор", () => {
  assert.equal(
    seoCatalogPath(),
    "/api/admin/v1/projects/{project}/content/seo",
  );
  assert.equal(
    seoCatalogPath({ type: "category", sort: "title", direction: "asc" }),
    "/api/admin/v1/projects/{project}/content/seo?type=category&sort=title&direction=asc",
  );
  assert.equal(
    seoCatalogPath({ cursor: "abc" }),
    "/api/admin/v1/projects/{project}/content/seo?cursor=abc",
  );
});

test("пересборка адресуется отдельным маршрутом", () => {
  assert.equal(
    seoRebuildPath(),
    "/api/admin/v1/projects/{project}/content/seo/rebuild",
  );
});
