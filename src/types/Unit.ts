export type UnitCode = "mg" | "g" | "µg" | "ml" | "j.m." | "mmol" | "kg" | "min" | "h";

export interface UnitDefinition {
  code: UnitCode;
  label: string;
}
