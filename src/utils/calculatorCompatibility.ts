import type { AdministrationRouteCode, CalculatorType, DrugProduct } from "../types";

const injectableFormPattern = /ampu|fiol|wstrzyk|infuz/i;

export function getCompatibleCalculatorCodes(
  product: DrugProduct,
  selectedRoute?: AdministrationRouteCode
): CalculatorType[] {
  const calculators = new Set<CalculatorType>();

  if (product.concentrationPerMl !== undefined) {
    calculators.add("DOSE_TO_ML");
    calculators.add("MG_PER_KG_TO_ML");
  }

  if (product.strengthUnit === "mg") {
    calculators.add("MG_PER_KG_TO_MG");
  }

  if (product.unitsPerMl !== undefined) {
    calculators.add("UNITS_TO_ML");
  }

  if (selectedRoute === "IV") {
    calculators.add("ML_PER_HOUR");
    calculators.add("DROPS_PER_MIN");
  }

  if (product.packageVolumeMl !== undefined && injectableFormPattern.test(product.form)) {
    calculators.add("AMPULE_COUNT");
  }

  if (calculators.size === 0) {
    calculators.add("MG_PER_KG_TO_MG");
  }

  return [...calculators];
}
