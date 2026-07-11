export type CalculatorType =
  | "DOSE_TO_ML"
  | "MG_PER_KG_TO_MG"
  | "MG_PER_KG_TO_ML"
  | "UNITS_TO_ML"
  | "ML_PER_HOUR"
  | "DROPS_PER_MIN"
  | "AMPULE_COUNT";

export interface CalculatorDefinition {
  code: CalculatorType;
  label: string;
  description: string;
}
