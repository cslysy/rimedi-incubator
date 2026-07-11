import type { CalculatorDefinition, CalculatorType } from "../types";

interface CalculatorSelectorProps {
  calculators: CalculatorDefinition[];
  onSelect: (calculator: CalculatorType) => void;
}

export function CalculatorSelector({ calculators, onSelect }: CalculatorSelectorProps) {
  return (
    <section className="screenBlock" aria-labelledby="calculator-selector-title">
      <p className="stepLabel">Krok 4 z 5</p>
      <h2 id="calculator-selector-title">Wybierz obliczenie</h2>
      <div className="resultList">
        {calculators.map((calculator) => (
          <button
            key={calculator.code}
            type="button"
            className="listButton"
            onClick={() => onSelect(calculator.code)}
          >
            <strong>{calculator.label}</strong>
            <span>{calculator.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
