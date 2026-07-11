export interface CalculationResult {
  value: number;
  unit: string;
  formula: string;
  inputs: Record<string, number>;
}

function assertPositive(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fieldName} musi być liczbą większą od zera.`);
  }
}

export function calculateDoseToMl(dose: number, concentrationPerMl: number): CalculationResult {
  assertPositive(dose, "Dawka zlecona");
  assertPositive(concentrationPerMl, "Stężenie na ml");

  return {
    value: dose / concentrationPerMl,
    unit: "ml",
    formula: "objętość = dawka zlecona / stężenie na ml",
    inputs: { dose, concentrationPerMl }
  };
}

export function calculateMgPerKgToMg(dosePerKg: number, weightKg: number): CalculationResult {
  assertPositive(dosePerKg, "Wartość mg/kg");
  assertPositive(weightKg, "Masa ciała");

  return {
    value: dosePerKg * weightKg,
    unit: "mg",
    formula: "dawka całkowita = wartość mg/kg * masa ciała",
    inputs: { dosePerKg, weightKg }
  };
}

export function calculateMgPerKgToMl(
  dosePerKg: number,
  weightKg: number,
  concentrationPerMl: number
): CalculationResult {
  assertPositive(dosePerKg, "Wartość mg/kg");
  assertPositive(weightKg, "Masa ciała");
  assertPositive(concentrationPerMl, "Stężenie na ml");

  const totalDose = dosePerKg * weightKg;

  return {
    value: totalDose / concentrationPerMl,
    unit: "ml",
    formula: "objętość = (wartość mg/kg * masa ciała) / stężenie na ml",
    inputs: { dosePerKg, weightKg, concentrationPerMl }
  };
}

export function calculateUnitsToMl(units: number, unitsPerMl: number): CalculationResult {
  assertPositive(units, "Liczba jednostek");
  assertPositive(unitsPerMl, "Jednostki na ml");

  return {
    value: units / unitsPerMl,
    unit: "ml",
    formula: "objętość = liczba jednostek / jednostki na ml",
    inputs: { units, unitsPerMl }
  };
}

export function calculateMlPerHour(volumeMl: number, timeHours: number): CalculationResult {
  assertPositive(volumeMl, "Objętość");
  assertPositive(timeHours, "Czas w godzinach");

  return {
    value: volumeMl / timeHours,
    unit: "ml/h",
    formula: "ml na godzinę = objętość / czas",
    inputs: { volumeMl, timeHours }
  };
}

export function calculateDropsPerMin(
  volumeMl: number,
  timeMinutes: number,
  dropsPerMl: number
): CalculationResult {
  assertPositive(volumeMl, "Objętość");
  assertPositive(timeMinutes, "Czas w minutach");
  assertPositive(dropsPerMl, "Liczba kropli/ml");

  return {
    value: (volumeMl * dropsPerMl) / timeMinutes,
    unit: "krople/min",
    formula: "krople na minutę = (objętość * krople/ml) / czas",
    inputs: { volumeMl, timeMinutes, dropsPerMl }
  };
}

export function calculateAmpuleCount(volumeToAdministerMl: number, ampuleVolumeMl: number): CalculationResult {
  assertPositive(volumeToAdministerMl, "Objętość do podania");
  assertPositive(ampuleVolumeMl, "Objętość ampułki");

  return {
    value: Math.ceil(volumeToAdministerMl / ampuleVolumeMl),
    unit: "amp.",
    formula: "liczba ampułek = zaokrąglenie w górę (objętość do podania / objętość ampułki)",
    inputs: { volumeToAdministerMl, ampuleVolumeMl }
  };
}
