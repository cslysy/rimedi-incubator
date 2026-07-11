import type { CalculatorType, DrugProduct, UnitCode } from "../types";
import {
  calculateAmpuleCount,
  calculateDoseToMl,
  calculateDropsPerMin,
  calculateMgPerKgToMg,
  calculateMgPerKgToMl,
  calculateMlPerHour,
  calculateUnitsToMl,
  type CalculationResult
} from "./calculations";
import {
  type CalculationInputValues,
  getCalculatorFields,
  validateFieldRange
} from "./calculatorParameters";

export function runCalculation(
  calculator: CalculatorType,
  product: DrugProduct,
  inputs: CalculationInputValues,
  doseUnit: UnitCode = product.strengthUnit ?? "mg"
): CalculationResult {
  const validationError = getCalculatorFields(calculator, product, doseUnit)
    .map((field) => validateFieldRange(field, inputs[field.key]))
    .find((error): error is string => error !== null);

  if (validationError) {
    throw new RangeError(validationError);
  }

  switch (calculator) {
    case "DOSE_TO_ML":
      return calculateDoseToMl(inputs.dose, inputs.concentrationPerMl);
    case "MG_PER_KG_TO_MG":
      return calculateMgPerKgToMg(inputs.dosePerKg, inputs.weightKg);
    case "MG_PER_KG_TO_ML":
      return calculateMgPerKgToMl(inputs.dosePerKg, inputs.weightKg, inputs.concentrationPerMl);
    case "UNITS_TO_ML":
      return calculateUnitsToMl(inputs.units, inputs.unitsPerMl);
    case "ML_PER_HOUR":
      return calculateMlPerHour(inputs.volumeMl, inputs.timeMinutes / 60);
    case "DROPS_PER_MIN":
      return calculateDropsPerMin(inputs.volumeMl, inputs.timeMinutes, inputs.dropsPerMl);
    case "AMPULE_COUNT":
      return calculateAmpuleCount(inputs.volumeMl, product.packageVolumeMl ?? 1);
  }
}
