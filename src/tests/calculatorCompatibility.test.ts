import { describe, expect, it } from "vitest";
import type { DrugProduct } from "../types";
import { getCompatibleCalculatorCodes } from "../utils/calculatorCompatibility";

const product: DrugProduct = {
  id: "rpl-product-test",
  drugId: "rpl-drug-test",
  tradeName: "Produkt RPL",
  activeSubstance: "Substantia",
  form: "Roztwór do wstrzykiwań",
  strengthValue: 10,
  strengthUnit: "mg",
  concentrationText: "10 mg/ml",
  concentrationPerMl: 10,
  concentrationUnit: "mg",
  packageVolumeMl: 2,
  routes: ["IV"],
  calculators: [],
  highRisk: false,
  sourceNote: "RPL"
};

describe("calculator compatibility", () => {
  it("derives calculators from technical product data and route", () => {
    expect(getCompatibleCalculatorCodes(product, "IV")).toEqual([
      "DOSE_TO_ML",
      "MG_PER_KG_TO_ML",
      "MG_PER_KG_TO_MG",
      "ML_PER_HOUR",
      "DROPS_PER_MIN",
      "AMPULE_COUNT"
    ]);
  });

  it("provides a user-input calculation when RPL has no compatible technical fields", () => {
    expect(
      getCompatibleCalculatorCodes({
        ...product,
        form: "Zioła do zaparzania",
        strengthValue: undefined,
        strengthUnit: undefined,
        concentrationText: "-",
        concentrationPerMl: undefined,
        concentrationUnit: undefined,
        packageVolumeMl: undefined,
        routes: []
      })
    ).toEqual(["MG_PER_KG_TO_MG"]);
  });

  it("supports products expressed in international units", () => {
    expect(
      getCompatibleCalculatorCodes({
        ...product,
        strengthValue: undefined,
        strengthUnit: undefined,
        concentrationText: "100 j.m./ml",
        concentrationPerMl: undefined,
        concentrationUnit: undefined,
        unitsPerMl: 100,
        packageVolumeMl: undefined,
        routes: ["SC"]
      }, "SC")
    ).toEqual(["UNITS_TO_ML"]);
  });
});
