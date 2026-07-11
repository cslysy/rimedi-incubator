import { describe, expect, it } from "vitest";
import {
  groupProductsByTradeName,
  groupProductsByVariant
} from "../components/ProductSelector";
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

  it("shows identical strengths and forms only once", () => {
    const original = createProduct("relanium-original", "Relanium", "5 mg");
    original.manufacturer = "GSK PSC Poland Sp. z o.o.";
    const parallelImport = createProduct("relanium-import", "Relanium", "5 mg");
    parallelImport.manufacturer = "Delfarma Sp. z o.o.";

    const variants = groupProductsByVariant([
      original,
      parallelImport,
      createProduct("relanium-2", "Relanium", "2 mg")
    ]);

    expect(variants.map((variant) => variant.concentrationText)).toEqual(["5 mg", "2 mg"]);
    expect(variants[0].products.map((product) => product.id)).toEqual([
      "relanium-original",
      "relanium-import"
    ]);
  });
});
