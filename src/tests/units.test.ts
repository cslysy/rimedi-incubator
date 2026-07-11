import { describe, expect, it } from "vitest";
import { convertMassValue, isMassUnit } from "../utils/units";

describe("unit helpers", () => {
  it("przelicza miligramy na gramy", () => {
    expect(convertMassValue(500, "mg", "g")).toBe(0.5);
  });

  it("przelicza mikrogramy na miligramy", () => {
    expect(convertMassValue(2500, "µg", "mg")).toBe(2.5);
  });

  it("rozpoznaje tylko jednostki masy obsługiwane w dawce", () => {
    expect(isMassUnit("mg")).toBe(true);
    expect(isMassUnit("ml")).toBe(false);
  });
});
