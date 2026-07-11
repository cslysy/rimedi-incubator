import type { CalculatorType, DrugProduct, UnitCode } from "../types";

export type CalculatorParameterKey =
  | "concentrationPerMl"
  | "dose"
  | "dosePerKg"
  | "dropsPerMl"
  | "timeMinutes"
  | "units"
  | "unitsPerMl"
  | "volumeMl"
  | "weightKg";

export interface CalculatorParameterField {
  key: CalculatorParameterKey;
  label: string;
  unit: string;
  integerDigits: number;
  decimalDigits: number;
  min: number;
  max: number;
}

export interface DerivedInputSummary {
  label: string;
  value: string;
}

export type CalculationInputValues = Record<CalculatorParameterKey, number>;

const defaultIntegerDigits = 4;
const defaultDecimalDigits = 1;

interface NumericDisplayConfig {
  integerDigits: number;
  decimalDigits: number;
  min: number;
  max: number;
}

const massDisplayConfig: Record<"mg" | "g" | "µg", NumericDisplayConfig> = {
  mg: {
    integerDigits: 5,
    decimalDigits: 2,
    min: 0.01,
    max: 99999.99
  },
  g: {
    integerDigits: 4,
    decimalDigits: 3,
    min: 0.001,
    max: 9999.999
  },
  "µg": {
    integerDigits: 6,
    decimalDigits: 0,
    min: 1,
    max: 999999
  }
};

export function getCalculatorTitle(calculator: CalculatorType): string {
  switch (calculator) {
    case "DOSE_TO_ML":
      return "Podaj dawkę zleconą";
    case "MG_PER_KG_TO_MG":
      return "Podaj wartość mg/kg i masę";
    case "MG_PER_KG_TO_ML":
      return "Podaj wartość mg/kg, masę i stężenie";
    case "UNITS_TO_ML":
      return "Podaj liczbę jednostek";
    case "ML_PER_HOUR":
      return "Podaj objętość i czas";
    case "DROPS_PER_MIN":
      return "Podaj dane wlewu";
    case "AMPULE_COUNT":
      return "Podaj objętość do podania";
  }
}

export function getDefaultInputValues(product: DrugProduct): CalculationInputValues {
  return {
    concentrationPerMl: product.concentrationPerMl ?? 1,
    dose: product.strengthValue ?? 100,
    dosePerKg: 1,
    dropsPerMl: 20,
    timeMinutes: 60,
    units: 100,
    unitsPerMl: product.unitsPerMl ?? 100,
    volumeMl: product.packageVolumeMl ?? 100,
    weightKg: 70
  };
}

export function getCalculatorFields(
  calculator: CalculatorType,
  product: DrugProduct,
  doseUnit: UnitCode
): CalculatorParameterField[] {
  const concentrationField =
    product.concentrationPerMl === undefined
      ? [createMassField("concentrationPerMl", "Stężenie na ml", doseUnit, true)]
      : [];

  switch (calculator) {
    case "DOSE_TO_ML":
      return [createMassField("dose", "Dawka zlecona", doseUnit), ...concentrationField];
    case "MG_PER_KG_TO_MG":
      return [
        createField("dosePerKg", "Wartość wpisana", "mg/kg"),
        createField("weightKg", "Masa ciała", "kg")
      ];
    case "MG_PER_KG_TO_ML":
      return [
        createField("dosePerKg", "Wartość wpisana", "mg/kg"),
        createField("weightKg", "Masa ciała", "kg"),
        ...(product.concentrationPerMl === undefined
          ? [createField("concentrationPerMl", "Stężenie na ml", "mg/ml")]
          : [])
      ];
    case "UNITS_TO_ML":
      return [
        createField("units", "Liczba jednostek", "j.m.", 5, 0, 1, 99999),
        ...(product.unitsPerMl === undefined
          ? [createField("unitsPerMl", "Jednostki na ml", "j.m./ml", 5, 0, 1, 99999)]
          : [])
      ];
    case "ML_PER_HOUR":
      return [
        createField("volumeMl", "Objętość", "ml"),
        createField("timeMinutes", "Czas", "min", 4, 0, 1, 9999)
      ];
    case "DROPS_PER_MIN":
      return [
        createField("volumeMl", "Objętość", "ml"),
        createField("timeMinutes", "Czas", "min", 4, 0, 1, 9999),
        createField("dropsPerMl", "Krople na ml", "krople/ml", 3, 0, 1, 999)
      ];
    case "AMPULE_COUNT":
      return [createField("volumeMl", "Objętość", "ml")];
  }
}

function createMassField(
  key: CalculatorParameterKey,
  label: string,
  unit: UnitCode,
  perMl = false
): CalculatorParameterField {
  const massUnit = unit === "g" || unit === "µg" ? unit : "mg";
  const config = massDisplayConfig[massUnit];

  return createField(
    key,
    label,
    perMl ? `${massUnit}/ml` : massUnit,
    config.integerDigits,
    config.decimalDigits,
    config.min,
    config.max
  );
}

export function getDerivedInputSummaries(
  calculator: CalculatorType,
  product: DrugProduct,
  doseUnit: UnitCode,
  inputs: CalculationInputValues
): DerivedInputSummary[] {
  const summaries: DerivedInputSummary[] = [];
  const usesConcentration = calculator === "DOSE_TO_ML" || calculator === "MG_PER_KG_TO_ML";

  if (usesConcentration && product.concentrationPerMl !== undefined) {
    const unit = calculator === "DOSE_TO_ML" ? doseUnit : "mg";
    summaries.push({
      label: "Stężenie z preparatu",
      value: `${inputs.concentrationPerMl} ${unit}/ml`
    });
  }

  if (calculator === "UNITS_TO_ML" && product.unitsPerMl !== undefined) {
    summaries.push({
      label: "Jednostki z preparatu",
      value: `${inputs.unitsPerMl} j.m./ml`
    });
  }

  if (calculator === "AMPULE_COUNT" && product.packageVolumeMl !== undefined) {
    summaries.push({
      label: "Objętość opakowania",
      value: `${product.packageVolumeMl} ml`
    });
  }

  return summaries;
}

export function validateFieldRange(field: CalculatorParameterField, value: number): string | null {
  if (!Number.isFinite(value)) {
    return `${field.label} musi być liczbą.`;
  }

  if (value < field.min || value > field.max) {
    return `${field.label} musi być w zakresie ${field.min}–${field.max} ${field.unit}.`;
  }

  return null;
}

function createField(
  key: CalculatorParameterKey,
  label: string,
  unit: string,
  integerDigits = defaultIntegerDigits,
  decimalDigits = defaultDecimalDigits,
  min = 0.1,
  max = 9999
): CalculatorParameterField {
  return {
    key,
    label,
    unit,
    integerDigits,
    decimalDigits,
    min,
    max
  };
}
