import assert from "node:assert/strict";
import { test } from "node:test";

import { formatMinor, majorToMinor, minorToMajor } from "./money.ts";

test("минорные единицы превращаются в сумму без потери копеек", () => {
  assert.equal(formatMinor(19900, "RUB"), "199,00 RUB");
  assert.equal(formatMinor(1, "RUB"), "0,01 RUB");
  assert.equal(formatMinor(0, "usd"), "0,00 USD");
});

test("валюты без минорных единиц не делятся на сто", () => {
  assert.equal(formatMinor(150, "JPY"), "150 JPY");
  assert.equal(minorToMajor(1500, "JPY"), 1500);
});

test("ввод оператора возвращается в минорные единицы округлением", () => {
  assert.equal(majorToMinor(199, "RUB"), 19900);
  assert.equal(majorToMinor(0.1 + 0.2, "RUB"), 30);
  assert.equal(majorToMinor(1500, "JPY"), 1500);
});
