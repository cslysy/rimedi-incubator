import { useMemo, useState } from "react";
import type { CalculatorType, DrugProduct, UnitCode } from "../types";
import type { CalculationResult } from "../utils/calculations";
import {
  getCalculatorFields,
  getCalculatorTitle,
  getDefaultInputValues,
  getDerivedInputSummaries,
  type CalculationInputValues,
  type CalculatorParameterKey
} from "../utils/calculatorParameters";
import { runCalculation } from "../utils/calculationRunner";
import { convertMassValue } from "../utils/units";
import { DigitWheelPicker } from "./DigitWheelPicker";
import { UnitPicker } from "./UnitPicker";

interface ParameterFormProps {
  product: DrugProduct;
  calculator: CalculatorType;
  onResult: (result: CalculationResult) => void;
}

interface NumericFieldProps {
  label: string;
  value: number;
  unit?: string;
  integerDigits?: number;
  decimalDigits?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

function NumericField({
  label,
  value,
  unit,
  integerDigits = 4,
  decimalDigits = 1,
  min = 0,
  max = 9999,
  onChange
}: NumericFieldProps) {
  return (
    <div className="numberField">
      <span className="fieldLabel">{label}</span>
      <div className="numberFieldControls">
        <DigitWheelPicker
          value={value}
          integerDigits={integerDigits}
          decimalDigits={decimalDigits}
          min={min}
          max={max}
          step={decimalDigits > 0 ? 10 ** -decimalDigits : 1}
          onChange={onChange}
        />
        {unit ? <span className="unitBadge">{unit}</span> : null}
      </div>
    </div>
  );
}

export function ParameterForm({ product, calculator, onResult }: ParameterFormProps) {
  const [doseUnit, setDoseUnit] = useState<UnitCode>(product.strengthUnit ?? "mg");
  const [inputs, setInputs] = useState<CalculationInputValues>(() => getDefaultInputValues(product));
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(() => getCalculatorTitle(calculator), [calculator]);
  const fields = useMemo(() => getCalculatorFields(calculator, product, doseUnit), [calculator, product, doseUnit]);
  const derivedInputs = useMemo(
    () => getDerivedInputSummaries(calculator, product, doseUnit, inputs),
    [calculator, product, doseUnit, inputs]
  );

  function changeInput(key: CalculatorParameterKey, value: number): void {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [key]: value
    }));
  }

  function changeDoseUnit(nextUnit: UnitCode): void {
    setInputs((currentInputs) => ({
      ...currentInputs,
      concentrationPerMl: Number(
        convertMassValue(currentInputs.concentrationPerMl, doseUnit, nextUnit).toFixed(3)
      ),
      dose: Number(convertMassValue(currentInputs.dose, doseUnit, nextUnit).toFixed(3))
    }));
    setDoseUnit(nextUnit);
  }

  function submit(): void {
    try {
      setError(null);
      onResult(runCalculation(calculator, product, inputs, doseUnit));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nie udało się wykonać obliczenia.");
    }
  }

  return (
    <section className="screenBlock" aria-labelledby="parameter-form-title">
      <p className="stepLabel">Krok 5 z 5</p>
      <h2 id="parameter-form-title">{title}</h2>
      <p className="mutedText">
        {product.tradeName}: {product.concentrationText}
      </p>

      {calculator === "DOSE_TO_ML" && (
        <div className="inlineField">
          <span className="fieldLabel">Jednostka dawki</span>
          <UnitPicker value={doseUnit} units={["mg", "g", "µg"]} onChange={changeDoseUnit} />
        </div>
      )}

      {fields.map((field) => (
        <NumericField
          key={field.key}
          label={field.label}
          value={inputs[field.key]}
          unit={field.unit}
          integerDigits={field.integerDigits}
          decimalDigits={field.decimalDigits}
          min={field.min}
          max={field.max}
          onChange={(value) => changeInput(field.key, value)}
        />
      ))}

      {derivedInputs.length > 0 && (
        <dl className="derivedInputs">
          {derivedInputs.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {error ? <p className="errorText">{error}</p> : null}
      <button type="button" className="primaryButton" onClick={submit}>
        Oblicz
      </button>
    </section>
  );
}
