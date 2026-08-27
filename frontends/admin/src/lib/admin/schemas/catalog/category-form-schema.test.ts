import assert from "node:assert/strict";
import { test } from "node:test";

import { categoryFormSchema, mockCategoryFormSchema } from "./category-form-schema.ts";

/** Валидная категория живого режима — денежных полей нет вовсе. */
const LIVE_VALUES = {
  name: "Аналитика",
  slug: "analitika",
  description: "",
  parentId: "",
  status: "Active",
  iconName: "Droplet",
  thumbnail: "/categories/thumbnails/cleansers-toners.webp",
  coverGradientStart: "#aabbcc",
  coverGradientEnd: "#ddeeff",
  displayOrder: 1,
};

test("живая схема принимает категорию без денежных полей", () => {
  const parsed = categoryFormSchema.parse(LIVE_VALUES);

  assert.equal(parsed.name, "Аналитика");
  assert.ok(!("revenue" in parsed), "живой режим не знает про revenue");
  assert.ok(!("growthYoY" in parsed), "живой режим не знает про growthYoY");
});

test("живая схема по-прежнему проверяет слаг", () => {
  const result = categoryFormSchema.safeParse({ ...LIVE_VALUES, slug: "Плохой Слаг" });

  assert.equal(result.success, false);
});

test("пустая локаль имени допустима и вычищается", () => {
  // Поле локали монтируется со значением undefined — «перевода нет».
  const parsed = categoryFormSchema.parse({
    ...LIVE_VALUES,
    nameTranslations: { de: undefined, en: "English", fr: "  " },
  });

  assert.deepEqual(parsed.nameTranslations, { en: "English" });
});

test("мок-схема шаблона требует торговые метрики демо-каталога", () => {
  assert.equal(mockCategoryFormSchema.safeParse(LIVE_VALUES).success, false);

  const parsed = mockCategoryFormSchema.parse({
    ...LIVE_VALUES,
    revenue: 128400,
    growthYoY: 21.6,
  });

  assert.equal(parsed.revenue, 128400);
  assert.equal(parsed.growthYoY, 21.6);
});

test("мок-схема отклоняет отрицательную выручку", () => {
  const result = mockCategoryFormSchema.safeParse({
    ...LIVE_VALUES,
    revenue: -1,
    growthYoY: 0,
  });

  assert.equal(result.success, false);
});
