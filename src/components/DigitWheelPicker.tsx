import { useRef } from "react";

interface DigitWheelPickerProps {
  value: number;
  integerDigits: number;
  decimalDigits: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) {
    return min;
  }

  if (max !== undefined && value > max) {
    return max;
  }

  return value;
}

function toDigits(value: number, integerDigits: number, decimalDigits: number): string[] {
  const fixedValue = Math.max(0, value).toFixed(decimalDigits);
  const [integerPart, decimalPart = ""] = fixedValue.split(".");
  const paddedInteger = integerPart.padStart(integerDigits, "0").slice(-integerDigits);

  return decimalDigits > 0 ? [...paddedInteger, ...decimalPart] : [...paddedInteger];
}

function fromDigits(digits: string[], integerDigits: number, decimalDigits: number): number {
  const integerPart = digits.slice(0, integerDigits).join("") || "0";
  const decimalPart = digits.slice(integerDigits).join("");
  const rawValue = decimalDigits > 0 ? `${integerPart}.${decimalPart}` : integerPart;

  return Number(rawValue);
}

export function DigitWheelPicker({
  value,
  integerDigits,
  decimalDigits,
  min,
  max,
  step = 1,
  onChange
}: DigitWheelPickerProps) {
  const digits = toDigits(value, integerDigits, decimalDigits);
  const touchStartYByDigit = useRef<Record<number, number>>({});
  const suppressClickByDigit = useRef<Record<number, boolean>>({});

  function changeDigit(index: number, direction: 1 | -1): void {
    const nextDigits = [...digits];
    const currentDigit = Number(nextDigits[index]);
    nextDigits[index] = String((currentDigit + direction + 10) % 10);
    onChange(clamp(fromDigits(nextDigits, integerDigits, decimalDigits), min, max));
  }

  function changeByStep(direction: 1 | -1): void {
    const nextValue = clamp(Number((value + step * direction).toFixed(decimalDigits)), min, max);
    onChange(nextValue);
  }

  function finishTouch(index: number, clientY: number): void {
    const startY = touchStartYByDigit.current[index];

    if (startY === undefined) {
      return;
    }

    const deltaY = startY - clientY;
    delete touchStartYByDigit.current[index];

    if (Math.abs(deltaY) >= 16) {
      suppressClickByDigit.current[index] = true;
      changeDigit(index, deltaY > 0 ? 1 : -1);
    }
  }

  return (
    <div className="digitPicker" aria-label="Wprowadzanie wartości liczbowej">
      <button type="button" className="stepButton" onClick={() => changeByStep(-1)} aria-label="Zmniejsz wartość">
        −
      </button>
      <div className="digitRow">
        {digits.map((digit, index) => (
          <div key={`${index}-${decimalDigits}`} className="digitSlot">
            {decimalDigits > 0 && index === integerDigits ? <span className="decimalSeparator">,</span> : null}
            <button
              type="button"
              className="digit"
              aria-label={`Cyfra ${index + 1}: ${digit}`}
              onClick={() => {
                if (suppressClickByDigit.current[index]) {
                  suppressClickByDigit.current[index] = false;
                  return;
                }

                changeDigit(index, 1);
              }}
              onTouchStart={(event) => {
                touchStartYByDigit.current[index] = event.touches[0]?.clientY ?? 0;
              }}
              onTouchEnd={(event) => {
                finishTouch(index, event.changedTouches[0]?.clientY ?? 0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  changeDigit(index, 1);
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  changeDigit(index, -1);
                }
              }}
              onWheel={(event) => {
                event.preventDefault();
                changeDigit(index, event.deltaY > 0 ? -1 : 1);
              }}
            >
              <span className="digitHint">{(Number(digit) + 9) % 10}</span>
              <strong>{digit}</strong>
              <span className="digitHint">{(Number(digit) + 1) % 10}</span>
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="stepButton" onClick={() => changeByStep(1)} aria-label="Zwiększ wartość">
        +
      </button>
    </div>
  );
}
