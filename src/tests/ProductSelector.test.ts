import { describe, expect, it } from "vitest";
import { groupProductsByTradeName } from "../components/ProductSelector";
import type { DrugProduct } from "../types";

function createProduct(id: string, tradeName: string, concentrationText: string): DrugProduct {
  return {
    id,
    drugId: "drug",
    tradeName,
    activeSubstance: "Substantia",
    form: "Tabletki",
    concentrationText,
    routes: ["PO"],
    calculators: ["MG_PER_KG_TO_MG"],
    highRisk: false,
    sourceNote: "Dane testowe."
  };
}

describe("ProductSelector", () => {
  it("groups products by trade name before dose selection", () => {
    const groups = groupProductsByTradeName([
      createProduct("forxiga-5", "Forxiga", "5 mg"),
      createProduct("forxiga-10", "Forxiga", "10 mg"),
      createProduct("edistride-5", "Edistride", "5 mg")
    ]);

    expect(groups.map((group) => group.tradeName)).toEqual(["Edistride", "Forxiga"]);
    expect(groups[1].products.map((product) => product.concentrationText)).toEqual(["5 mg", "10 mg"]);
  });
});
