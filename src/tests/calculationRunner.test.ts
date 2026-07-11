import { describe, expect, it } from "vitest";
import type { DrugProduct } from "../types";
import { runCalculation } from "../utils/calculationRunner";
import { getDefaultInputValues } from "../utils/calculatorParameters";

const product: DrugProduct = {
  id: "demo-amp",
  drugId: "demo",
  tradeName: "Demo Ampułka",
  activeSubstance: "Demo",
  form: "ampułka",
  concentrationText: "250 mg / 2 ml",
  concentrationPerMl: 125,
  packageVolumeMl: 2,
  routes: ["IV"],
  calculators: ["DOSE_TO_ML", "AMPULE_COUNT"],
  highRisk: false,
  sourceNote: "Dane demonstracyjne."
};

describe("calculation runner", () => {
  it("uruchamia kalkulator dawka na ml z jednego modelu wejścia", () => {
    const inputs = {
      ...getDefaultInputValues(product),
      dose: 500,
      concentrationPerMl: 125
    };

    expect(runCalculation("DOSE_TO_ML", product, inputs).value).toBe(4);
  });

  it("odrzuca wartość poza zakresem zanim uruchomi kalkulator", () => {
    const inputs = {
      ...getDefaultInputValues(product),
      volumeMl: 0
    };

    expect(() => runCalculation("AMPULE_COUNT", product, inputs)).toThrow(RangeError);
  });
});

describe("calculation runner units", () => {
  it("runs dose to ml after changing the unit to grams", () => {
    const inputs = {
      ...getDefaultInputValues(product),
      dose: 0.5,
      concentrationPerMl: 0.125
    };

    expect(runCalculation("DOSE_TO_ML", product, inputs, "g").value).toBe(4);
  });
});
