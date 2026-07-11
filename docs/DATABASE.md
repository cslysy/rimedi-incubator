# DATABASE.md

## Cel bazy
Aplikacja docelowo ma obsługiwać kompletną bazę produktów leczniczych dopuszczonych do obrotu w Polsce.

Na etapie MVP użyj lokalnej przykładowej bazy kilku leków, ale architektura musi być gotowa na kilka tysięcy produktów.

## Źródło docelowe
Docelowo dane mogą pochodzić z oficjalnego Rejestru Produktów Leczniczych w Polsce, ale importer nie jest częścią MVP.

W MVP:
- dane są statyczne,
- lokalne,
- zapisane w `src/data/drugs.json`,
- bez pobierania czegokolwiek z internetu.

## Rozdzielenie danych
Oddziel:

1. Dane produktu leczniczego:
- nazwa,
- substancja,
- postać,
- moc/stężenie,
- producent,
- ATC,
- drogi podania.

2. Metadane aplikacji:
- dostępne kalkulatory,
- highRisk,
- domyślne jednostki,
- sourceNote,
- ustawienia UI.

## Przykładowy model produktu

```ts
export interface DrugProduct {
  id: string;
  tradeName: string;
  activeSubstance: string;
  form: string;
  strengthValue?: number;
  strengthUnit?: string;
  concentrationText: string;
  packageVolumeMl?: number;
  manufacturer?: string;
  atcCode?: string;
  routes: AdministrationRouteCode[];
  calculators: CalculatorType[];
  highRisk: boolean;
  sourceNote: string;
  updatedAt?: string;
}
```

## Drogi podania
Przechowuj jako kod techniczny, wyświetlaj po polsku.

Przykład:

```json
{
  "code": "IV",
  "label": "Dożylnie",
  "display": "Dożylnie (IV)"
}
```

Przykładowe kody:
- IV — dożylnie,
- IM — domięśniowo,
- SC — podskórnie,
- PO — doustnie,
- SL — podjęzykowo,
- PR — doodbytniczo,
- INH — wziewnie,
- TOP — miejscowo.

## Przykładowe leki MVP
Przygotuj lokalną bazę dla:
- Paracetamol,
- Ceftriakson,
- Furosemid,
- Enoksaparyna,
- Insulina,
- Heparyna,
- Metamizol,
- Pantoprazol.

Dane mogą być demonstracyjne, ale nie mogą sugerować dawkowania.

## Wydajność wyszukiwania
Wyszukiwarka musi być gotowa na kilka tysięcy produktów.

Wymagania:
- wyszukiwanie lokalne,
- filtrowanie w czasie rzeczywistym,
- wyszukiwanie po nazwie handlowej,
- wyszukiwanie po substancji czynnej,
- gotowość pod wyszukiwanie bez polskich znaków,
- gotowość pod fuzzy search w przyszłości.
