# UX.md

## Styl
- Mobile-first.
- Prosty, nowoczesny interfejs.
- Duże przyciski.
- Duże odstępy.
- Jasny motyw.
- Czytelność na telefonie ważniejsza niż liczba informacji na ekranie.
- Bez zewnętrznych UI frameworków.
- Bez Tailwinda.
- CSS modules albo zwykły CSS.

## Ogólne zasady UX
- Jeden ekran = jedna decyzja.
- Nie pokazuj pól, które nie są potrzebne.
- Pomijaj kroki, które da się ustalić z danych.
- Użytkownik powinien widzieć, gdzie jest w flow.
- Na ekranie wyniku pokazuj duży, jednoznaczny wynik.

## DigitWheelPicker
Najważniejszy autorski komponent UI.

Wygląd przykładowy:

```text
[0][2][5][0].[0] mg
```

Wymagania:
- każda cyfra jest osobnym pionowym pickerem,
- użytkownik może przesuwać cyfrę palcem w górę/dół,
- na komputerze działa scroll myszką nad daną cyfrą,
- separator dziesiętny jest stały,
- jednostka jest osobnym komponentem UnitPicker,
- komponent ma działać płynnie na telefonie,
- wartości mają być walidowane.

Props sugerowane:

```ts
interface DigitWheelPickerProps {
  value: number;
  integerDigits: number;
  decimalDigits: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}
```

## UnitPicker
Jednostki mają być ograniczone do sensownych dla danego preparatu i kalkulatora.

Przykłady:
- mg
- g
- µg
- ml
- j.m.
- mmol
- kg
- min
- h

## Dostępność
- Przyciski muszą być duże i łatwe do trafienia palcem.
- Tekst musi mieć dobry kontrast.
- Ważne wyniki nie mogą zależeć tylko od koloru.
- Komponenty powinny mieć sensowne aria-label tam, gdzie to możliwe.

## Bezpieczeństwo UX
- Nigdy nie używaj słowa „zalecana dawka”.
- Używaj „dawka zlecona” albo „wartość wpisana przez użytkownika”.
- Dla highRisk pokaż wyraźne ostrzeżenie.
- Na wyniku zawsze pokaż, z jakich danych policzono wynik.
