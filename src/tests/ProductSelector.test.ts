import { describe, expect, it } from "vitest";
import {
  groupProductsByTradeName,
  groupProductsByVariant,
  groupVariantsByForm
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

  it("groups available strengths under their pharmaceutical form", () => {
    const injection = createProduct("relanium-injection", "Relanium", "5 mg/ml");
    injection.form = "Roztwór do wstrzykiwań";
    const tabletFive = createProduct("relanium-5", "Relanium", "5 mg");
    tabletFive.strengthValue = 5;
    const tabletTwo = createProduct("relanium-2", "Relanium", "2 mg");
    tabletTwo.strengthValue = 2;

    const groups = groupVariantsByForm(
      groupProductsByVariant([tabletFive, injection, tabletTwo])
    );

    expect(groups.map((group) => group.form)).toEqual([
      "Roztwór do wstrzykiwań",
      "Tabletki"
    ]);
    expect(groups[1].variants.map((variant) => variant.concentrationText)).toEqual([
      "2 mg",
      "5 mg"
    ]);
  });
});
