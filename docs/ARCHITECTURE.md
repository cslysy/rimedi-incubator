# ARCHITECTURE.md

## Technologie
- React
- TypeScript
- Vite
- PWA
- Vitest dla testów
- CSS modules albo zwykły CSS

## Zakazy
- Nie dodawaj backendu.
- Nie dodawaj logowania.
- Nie dodawaj kont użytkowników.
- Nie dodawaj Google Calendar.
- Nie dodawaj zewnętrznych API.
- Nie wykonuj żadnych połączeń sieciowych.
- Nie używaj danych medycznych jako zaleceń dawkowania.
- Nie implementuj funkcji „zalecana dawka”.

## Struktura katalogów

```text
src/
 ├── components/
 │    ├── DigitWheelPicker.tsx
 │    ├── UnitPicker.tsx
 │    ├── DrugSearch.tsx
 │    ├── ProductSelector.tsx
 │    ├── RouteSelector.tsx
 │    ├── CalculatorSelector.tsx
 │    ├── ParameterForm.tsx
 │    └── ResultPanel.tsx
 │
 ├── data/
 │    └── drugs.json
 │
 ├── metadata/
 │    ├── calculators.json
 │    ├── routes.json
 │    └── units.json
 │
 ├── pages/
 │    ├── HomePage.tsx
 │    └── DrugFlowPage.tsx
 │
 ├── services/
 │    └── DrugRepository.ts
 │
 ├── types/
 │    ├── Drug.ts
 │    ├── DrugProduct.ts
 │    ├── CalculatorType.ts
 │    ├── Route.ts
 │    └── Unit.ts
 │
 ├── utils/
 │    ├── calculations.ts
 │    ├── format.ts
 │    └── search.ts
 │
 ├── tests/
 │    └── calculations.test.ts
 │
 ├── App.tsx
 ├── main.tsx
 └── index.css
```

## Stan aplikacji
Na MVP można użyć lokalnego stanu React.
Nie trzeba dodawać Redux/Zustand.

Stan flow powinien zawierać:
- wybrany lek,
- wybrany preparat,
- wybraną drogę podania,
- wybrany typ obliczenia,
- parametry wejściowe,
- wynik.

## DrugRepository
Warstwa odpowiedzialna za:
- ładowanie lokalnych danych,
- wyszukiwanie po nazwie i substancji,
- pobieranie produktów dla leku,
- pobieranie dostępnych dróg podania,
- pobieranie dostępnych kalkulatorów.

Komponenty UI nie powinny bezpośrednio filtrować surowego JSON-a, jeśli logika jest bardziej złożona. Użyj DrugRepository.

## PWA
Wymagania:
- manifest,
- service worker,
- działanie offline,
- placeholdery ikon,
- build działa bez internetu.

Można użyć vite-plugin-pwa, o ile nie wymaga żadnego zewnętrznego API w runtime.
