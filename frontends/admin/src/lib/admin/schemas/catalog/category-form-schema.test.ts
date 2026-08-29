import assert from "node:assert/strict";
import { test } from "node:test";

import { categoryFormSchema } from "./category-form-schema.ts";

/** Валидная категория: денежных полей у платформы нет вовсе. */
const VALUES = {
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

test("схема принимает категорию без денежных полей", () => {
  const parsed = categoryFormSchema.parse(VALUES);

  assert.equal(parsed.name, "Аналитика");
  assert.ok(!("revenue" in parsed), "платформа не знает про revenue");
  assert.ok(!("growthYoY" in parsed), "платформа не знает про growthYoY");
});

test("схема проверяет слаг", () => {
  const result = categoryFormSchema.safeParse({ ...VALUES, slug: "Плохой Слаг" });

  assert.equal(result.success, false);
});

test("пустая локаль имени допустима и вычищается", () => {
  // Поле локали монтируется со значением undefined — «перевода нет».
  const parsed = categoryFormSchema.parse({
    ...VALUES,
    nameTranslations: { de: undefined, en: "English", fr: "  " },
  });

  assert.deepEqual(parsed.nameTranslations, { en: "English" });
});
