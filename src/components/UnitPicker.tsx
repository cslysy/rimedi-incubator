import type { UnitCode } from "../types";

interface UnitPickerProps {
  value: UnitCode;
  units: UnitCode[];
  onChange: (unit: UnitCode) => void;
}

export function UnitPicker({ value, units, onChange }: UnitPickerProps) {
  return (
    <div className="segmentedControl" role="group" aria-label="Wybierz jednostkę">
      {units.map((unit) => (
        <button
          key={unit}
          type="button"
          className={unit === value ? "selected" : ""}
          onClick={() => onChange(unit)}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
