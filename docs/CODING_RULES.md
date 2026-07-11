# CODING_RULES.md

## TypeScript
- Strict TypeScript.
- Nie używaj `any`, jeśli da się tego uniknąć.
- Typy domenowe trzymaj w `src/types`.
- Funkcje obliczeniowe mają być czyste i testowalne.

## React
- Preferuj małe komponenty.
- Nie twórz komponentów dłuższych niż około 250 linii, jeśli da się podzielić.
- Logika domenowa nie powinna być zaszyta w JSX.
- Komponenty powinny dostawać dane przez propsy.

## Styl
- CSS modules albo zwykły CSS.
- Bez Tailwinda.
- Bez zewnętrznych UI frameworków.
- Mobile-first.

## Sieć
- Runtime aplikacji nie może wykonywać requestów sieciowych.
- Nie dodawaj fetch/axios.
- Nie dodawaj integracji z żadnym API.
- Nie dodawaj backendu.

## Dane medyczne
- Nie implementuj zaleceń dawkowania.
- Nie dodawaj treści sugerujących dawkę terapeutyczną.
- Dane demonstracyjne mają służyć tylko do testowania przeliczeń technicznych.
- Każdy ekran wyniku musi zawierać komunikat bezpieczeństwa.

## Testy
- Funkcje z `utils/calculations.ts` muszą mieć testy.
- Testuj obliczenia, formatowanie i walidację zakresów.

## Dostępność
- Używaj czytelnych labeli.
- Ważne przyciski powinny mieć dostępne nazwy.
- Nie polegaj wyłącznie na kolorze.
