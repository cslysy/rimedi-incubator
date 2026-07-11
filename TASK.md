# TASK.md

## Zadanie dla Codexa — pierwszy krok

Przeczytaj pliki z katalogu `docs/`:

- `docs/PRODUCT.md`
- `docs/FLOW.md`
- `docs/UX.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/CALCULATORS.md`
- `docs/CODING_RULES.md`
- `docs/ROADMAP.md`

Następnie wygeneruj szkielet aplikacji zgodny z dokumentacją.

## Zakres tej iteracji

Zaimplementuj tylko MVP-szkielet:

1. Utwórz projekt React + TypeScript + Vite.
2. Skonfiguruj PWA offline.
3. Utwórz strukturę katalogów z `docs/ARCHITECTURE.md`.
4. Dodaj lokalną przykładową bazę leków w `src/data/drugs.json`.
5. Dodaj typy domenowe w `src/types`.
6. Dodaj `DrugRepository`.
7. Dodaj ekrany:
   - HomePage,
   - DrugFlowPage.
8. Dodaj komponenty:
   - DrugSearch,
   - ProductSelector,
   - RouteSelector,
   - CalculatorSelector,
   - ParameterForm,
   - ResultPanel,
   - DigitWheelPicker,
   - UnitPicker.
9. Dodaj funkcje obliczeniowe w `src/utils/calculations.ts`.
10. Dodaj podstawowe testy Vitest dla obliczeń.

## Ważne ograniczenia

- Nie dodawaj backendu.
- Nie dodawaj logowania.
- Nie wykonuj requestów sieciowych.
- Nie dodawaj zewnętrznych API.
- Nie implementuj zaleceń dawkowania.
- Aplikacja ma tylko przeliczać wartości wpisane przez użytkownika.

## Oczekiwany rezultat

Po wykonaniu zadania aplikację powinno dać się uruchomić lokalnie komendą:

```bash
npm install
npm run dev
```

A testy powinny działać komendą:

```bash
npm test
```
