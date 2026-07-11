import type { AdministrationRouteCode, CalculatorType, DrugProduct } from "../types";
import type { CalculationResult } from "../utils/calculations";
import { formatNumber } from "../utils/format";

interface ResultPanelProps {
  product: DrugProduct;
  route?: AdministrationRouteCode;
  routeDisplay?: string;
  calculator: CalculatorType;
  calculatorLabel?: string;
  result: CalculationResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEditInputs: () => void;
  onRestart: () => void;
}

const safetyMessage =
  "Aplikacja wykonuje wyłącznie obliczenia pomocnicze na podstawie danych wpisanych przez użytkownika. Nie zastępuje zlecenia lekarskiego ani procedur obowiązujących w placówce.";

const inputLabels: Record<string, string> = {
  ampuleVolumeMl: "Objętość ampułki",
  concentrationPerMl: "Stężenie na ml",
  dose: "Dawka zlecona",
  dosePerKg: "Wartość mg/kg",
  dropsPerMl: "Krople na ml",
  timeHours: "Czas w godzinach",
  timeMinutes: "Czas w minutach",
  units: "Liczba jednostek",
  unitsPerMl: "Jednostki na ml",
  volumeMl: "Objętość",
  volumeToAdministerMl: "Objętość do podania",
  weightKg: "Masa ciała"
};

export function ResultPanel({
  product,
  route,
  routeDisplay,
  calculator,
  calculatorLabel,
  result,
  isFavorite,
  onToggleFavorite,
  onEditInputs,
  onRestart
}: ResultPanelProps) {
  return (
    <section className="screenBlock" aria-labelledby="result-title">
      <p className="stepLabel">Wynik</p>
      <h2 id="result-title">Wynik obliczenia</h2>
      {product.highRisk ? (
        <p className="warningText">Uwaga: preparat oznaczony jako highRisk. Zweryfikuj dane wejściowe.</p>
      ) : null}
      <div className="resultHero" aria-live="polite">
        <span>{formatNumber(result.value)}</span>
        <strong>{result.unit}</strong>
      </div>
      <dl className="summaryList">
        <div>
          <dt>Lek</dt>
          <dd>{product.tradeName}</dd>
        </div>
        <div>
          <dt>Droga</dt>
          <dd>{routeDisplay ?? route ?? "Nie dotyczy"}</dd>
        </div>
        <div>
          <dt>Obliczenie</dt>
          <dd>{calculatorLabel ?? calculator}</dd>
        </div>
        <div>
          <dt>Stężenie / moc</dt>
          <dd>{product.concentrationText}</dd>
        </div>
        <div>
          <dt>Informacja o danych</dt>
          <dd>{product.sourceNote}</dd>
        </div>
      </dl>
      <details className="detailsBlock">
        <summary>Pokaż obliczenia</summary>
        <p>{result.formula}</p>
        <ul>
          {Object.entries(result.inputs).map(([key, value]) => (
            <li key={key}>
              {inputLabels[key] ?? key}: {formatNumber(value)}
            </li>
          ))}
        </ul>
      </details>
      <p className="safetyText">{safetyMessage}</p>
      <button type="button" className="secondaryButton" onClick={onEditInputs}>
        Zmień dane wejściowe
      </button>
      <button type="button" className="secondaryButton" onClick={onToggleFavorite}>
        {isFavorite ? "Usuń z ulubionych" : "Dodaj preparat do ulubionych"}
      </button>
      <button type="button" className="secondaryButton" onClick={onRestart}>
        Nowe obliczenie
      </button>
    </section>
  );
}
