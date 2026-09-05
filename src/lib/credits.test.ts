import assert from "node:assert/strict";
import { test } from "node:test";
import {
  festivalTag,
  formatCreditLabel,
  preservesBrandCase,
} from "./credits";

test("festivalTag shortens Sundance and requires name + year", () => {
  assert.equal(festivalTag({ festival: null }), null);
  assert.equal(
    festivalTag({
      festival: {
        name: "Sundance Film Festival",
        year: "2026",
        selection: "Official Selection",
      },
    }),
    "(Sundance 2026)",
  );
  assert.equal(
    festivalTag({
      festival: { name: "Berlinale", year: "2024", selection: "Official Selection" },
    }),
    "(Berlinale 2024)",
  );
});

test("formatCreditLabel joins brand, festival, and project", () => {
  assert.equal(
    formatCreditLabel({
      brand: "Huella",
      project: "Teaser",
      festival: {
        name: "Sundance Film Festival",
        year: "2023",
        selection: "Official Selection",
      },
    }),
    "Huella (Sundance 2023) — Teaser",
  );
  assert.equal(
    formatCreditLabel({
      brand: "Reebok",
      project: "Lola Indigo",
      festival: null,
    }),
    "Reebok — Lola Indigo",
  );
});

test("preservesBrandCase only for b:oost", () => {
  assert.equal(preservesBrandCase("b:oost"), true);
  assert.equal(preservesBrandCase("B:OOST"), true);
  assert.equal(preservesBrandCase("Reebok"), false);
});
