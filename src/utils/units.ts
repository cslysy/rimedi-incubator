import type { UnitCode } from "../types";

const massUnitFactorsToMg: Partial<Record<UnitCode, number>> = {
  "µg": 0.001,
  mg: 1,
  g: 1000
};

export function isMassUnit(unit: UnitCode): boolean {
  return massUnitFactorsToMg[unit] !== undefined;
}

export function convertMassValue(value: number, fromUnit: UnitCode, toUnit: UnitCode): number {
  const fromFactor = massUnitFactorsToMg[fromUnit];
  const toFactor = massUnitFactorsToMg[toUnit];

  if (fromFactor === undefined || toFactor === undefined) {
    throw new RangeError("Nieobsługiwana jednostka masy.");
  }

  return (value * fromFactor) / toFactor;
}
