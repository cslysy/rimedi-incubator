import { describe, expect, it } from "vitest";
import type { Drug, DrugProduct } from "../types";
import { buildDrugSearchResults, formatSubstituteCount } from "../utils/drugSearchResults";

function product(id: string, tradeName: string): DrugProduct {
  return {
    id,
    drugId: "diazepam",
    tradeName,
    activeSubstance: "Diazepamum",
    form: "Tabletki",
    concentrationText: "5 mg",
    routes: ["PO"],
    calculators: [],
    highRisk: false,
    sourceNote: "Test"
  };
}

const diazepam: Drug = {
  id: "diazepam",
  name: "Diazepamum",
  activeSubstance: "Diazepamum",
  products: [
    product("relanium-5", "Relanium"),
    product("relanium-10", "Relanium"),
    product("neorelium", "Neorelium"),
    product("relse", "Relse")
  ]
};

describe("buildDrugSearchResults", () => {
  it("pokazuje nazwę handlową, substancję i liczbę pozostałych zamienników", () => {
    const results = buildDrugSearchResults([diazepam], "relanium");

    expect(results).toEqual([
      {
        drug: diazepam,
        matchedTradeName: "Relanium",
        substituteCount: 2
      }
    ]);
  });

  it("nie rozbija wyniku na nazwy handlowe, gdy pasuje substancja czynna", () => {
    const results = buildDrugSearchResults([diazepam], "diazepam");

    expect(results).toEqual([{ drug: diazepam, substituteCount: 3 }]);
  });

  it("odmienia opis liczby zamienników", () => {
    expect(formatSubstituteCount(1)).toBe("1 dostępny zamiennik");
    expect(formatSubstituteCount(2)).toBe("2 dostępne zamienniki");
    expect(formatSubstituteCount(12)).toBe("12 dostępnych zamienników");
  });
});
