import assert from "node:assert/strict";
import { test } from "node:test";

import {
  citiesAdaptSeoPath,
  citiesEnableAllPath,
  citiesPath,
  citiesResetPath,
  cityPath,
  cityRegionsPath,
  citySeoPath,
} from "./cities-paths.ts";

test("без отбора путь остаётся без строки запроса", () => {
  assert.equal(citiesPath(), "/api/admin/v1/projects/{project}/content/cities");
});

test("отбор и сортировка собираются в строку запроса", () => {
  assert.equal(
    citiesPath({
      search: "Казань",
      regionId: 7,
      enabled: true,
      sort: "name",
      direction: "asc",
      cursor: "abc",
    }),
    "/api/admin/v1/projects/{project}/content/cities?search=%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%8C&region_id=7&enabled=1&sort=name&direction=asc&cursor=abc",
  );
});

test("выключенные города отбираются нулём, а не пропуском параметра", () => {
  assert.equal(
    citiesPath({ enabled: false }),
    "/api/admin/v1/projects/{project}/content/cities?enabled=0",
  );
});

test("пути действий раздела строятся от общей базы", () => {
  const base = "/api/admin/v1/projects/{project}/content/cities";

  assert.equal(cityRegionsPath(), `${base}/regions`);
  assert.equal(cityPath(12), `${base}/12`);
  assert.equal(citiesEnableAllPath(), `${base}/enable-all`);
  assert.equal(citiesResetPath(), `${base}/reset`);
  assert.equal(citySeoPath(12), `${base}/12/seo`);
  assert.equal(citiesAdaptSeoPath(), `${base}/adapt-seo`);
});
