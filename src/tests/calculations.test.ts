import { describe, expect, it } from "vitest";
import {
  calculateAmpuleCount,
  calculateDoseToMl,
  calculateDropsPerMin,
  calculateMgPerKgToMg,
  calculateMgPerKgToMl,
  calculateMlPerHour,
  calculateUnitsToMl
} from "../utils/calculations";

describe("calculations", () => {
  it("przelicza 500 mg przy stężeniu 250 mg / 2 ml na 4 ml", () => {
    expect(calculateDoseToMl(500, 125).value).toBe(4);
  });

  it("przelicza 5 mg/kg przy masie 72 kg na 360 mg", () => {
    expect(calculateMgPerKgToMg(5, 72).value).toBe(360);
  });

  it("przelicza mg/kg na ml", () => {
    expect(calculateMgPerKgToMl(5, 72, 40).value).toBe(9);
  });

  it("przelicza jednostki na ml", () => {
    expect(calculateUnitsToMl(500, 100).value).toBe(5);
  });

  it("przelicza 100 ml przez 30 minut na 200 ml/h", () => {
    expect(calculateMlPerHour(100, 0.5).value).toBe(200);
  });

  it("przelicza 500 ml przez 240 minut przy 20 kroplach/ml na około 41.67 kropli/min", () => {
    expect(calculateDropsPerMin(500, 240, 20).value).toBeCloseTo(41.67, 2);
  });

  it("zaokrągla liczbę ampułek w górę", () => {
    expect(calculateAmpuleCount(5, 2).value).toBe(3);
  });

  it("odrzuca wartości spoza zakresu", () => {
    expect(() => calculateDoseToMl(0, 125)).toThrow(RangeError);
  });
});
