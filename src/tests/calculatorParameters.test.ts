import { describe, expect, it } from "vitest";
import type { DrugProduct } from "../types";
import {
  getCalculatorFields,
  getCalculatorTitle,
  getDefaultInputValues,
  getDerivedInputSummaries,
  validateFieldRange
} from "../utils/calculatorParameters";

const productWithConcentration: DrugProduct = {
  id: "demo-infusion",
  drugId: "demo",
  tradeName: "Demo Infuzja",
  activeSubstance: "Demo",
  form: "roztwór",
  concentrationText: "10 mg / ml",
  concentrationPerMl: 10,
  unitsPerMl: 100,
  packageVolumeMl: 2,
  routes: ["IV"],
  calculators: ["DOSE_TO_ML", "UNITS_TO_ML"],
  highRisk: false,
  sourceNote: "Dane demonstracyjne."
};

const productWithoutConcentration: DrugProduct = {
  ...productWithConcentration,
  id: "demo-powder",
  concentrationPerMl: undefined,
  unitsPerMl: undefined
};

describe("calculator parameter definitions", () => {
  it("zwraca tytuł dla kalkulatora ml/h", () => {
    expect(getCalculatorTitle("ML_PER_HOUR")).toBe("Podaj objętość i czas");
  });

  it("zwraca tylko potrzebne pola dla kalkulatora krople/min", () => {
    expect(getCalculatorFields("DROPS_PER_MIN", productWithConcentration, "mg").map((field) => field.key)).toEqual([
      "volumeMl",
      "timeMinutes",
      "dropsPerMl"
    ]);
  });

  it("waliduje zakres pola", () => {
    const [field] = getCalculatorFields("UNITS_TO_ML", productWithoutConcentration, "mg");

    expect(validateFieldRange(field, 0)).toContain("zakres");
    expect(validateFieldRange(field, 100)).toBeNull();
  });

  it("pomija stężenie, gdy wynika z preparatu", () => {
    expect(getCalculatorFields("DOSE_TO_ML", productWithConcentration, "mg").map((field) => field.key)).toEqual([
      "dose"
    ]);
  });

  it("pyta o stężenie, gdy nie wynika z preparatu", () => {
    expect(getCalculatorFields("DOSE_TO_ML", productWithoutConcentration, "mg").map((field) => field.key)).toEqual([
      "dose",
      "concentrationPerMl"
    ]);
  });

  it("pokazuje wartości wyprowadzone z preparatu", () => {
    const inputs = getDefaultInputValues(productWithConcentration);

    expect(getDerivedInputSummaries("UNITS_TO_ML", productWithConcentration, "mg", inputs)).toEqual([
      {
        label: "Jednostki z preparatu",
        value: "100 j.m./ml"
      }
    ]);
  });
});

describe("mass unit field configuration", () => {
  it("uses gram precision", () => {
    const [field] = getCalculatorFields("DOSE_TO_ML", productWithConcentration, "g");

    expect(field).toMatchObject({
      integerDigits: 4,
      decimalDigits: 3,
      min: 0.001
    });
  });

  it("fits six-digit microgram values", () => {
    const [field] = getCalculatorFields("DOSE_TO_ML", productWithConcentration, "µg");

    expect(field).toMatchObject({
      integerDigits: 6,
      decimalDigits: 0,
      min: 1
    });
  });
});
