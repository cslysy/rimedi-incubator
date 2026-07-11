# FLOW.md

## Zasada główna
Aplikacja zaczyna od wyboru leku. Użytkownik nie wybiera najpierw typu kalkulatora.

Docelowy przepływ:

1. Ekran startowy
2. Wybór leku
3. Wybór konkretnego preparatu / postaci / stężenia
4. Droga podania — tylko jeśli jest więcej niż jedna
5. Wybór dostępnego obliczenia — tylko jeśli jest więcej niż jedno
6. Parametry obliczenia
7. Wynik

## Najmniej możliwych pytań
Aplikacja ma automatycznie pomijać ekrany, jeśli decyzja wynika z danych.

Przykłady:
- jeśli preparat ma tylko jedną drogę podania, wybierz ją automatycznie;
- jeśli preparat ma tylko jedno stężenie, nie pytaj o stężenie;
- jeśli preparat ma tylko jeden typ kalkulatora, wybierz go automatycznie;
- jeśli obliczenie nie wymaga masy ciała, nie pokazuj pola masy;
- jeśli użytkownik wybierze lek doustny, nie pokazuj kalkulatorów typowych dla wlewów;
- jeśli jednostka wynika z preparatu, ustaw ją domyślnie.

## 1. Ekran startowy
Elementy:
- tytuł aplikacji,
- przycisk „Oblicz lek”,
- sekcja „Ostatnio używane”,
- sekcja „Ulubione”.

Akcja:
- kliknięcie „Oblicz lek” przechodzi do wyszukiwarki leków.

## 2. Wybór leku
Użytkownik wyszukuje po:
- nazwie handlowej,
- substancji czynnej.

Wymagania:
- podpowiedzi od minimum 2 znaków,
- wyszukiwanie lokalne,
- brak requestów sieciowych,
- wynik może grupować produkty po substancji lub nazwie.

Po wyborze leku aplikacja przechodzi do wyboru produktu/preparatu.

## 3. Wybór preparatu / postaci / stężenia
Aplikacja pokazuje tylko realne warianty danego leku, np.:
- tabletki,
- roztwór do infuzji,
- ampułka,
- fiolka,
- proszek do sporządzania roztworu,
- konkretna moc/stężenie.

Jeśli jest tylko jeden wariant, wybierz go automatycznie.

## 4. Droga podania
Aplikacja pokazuje wyłącznie drogi podania dostępne dla wybranego preparatu.

Przykłady wyświetlania:
- Dożylnie (IV)
- Domięśniowo (IM)
- Podskórnie (SC)
- Doustnie (PO)
- Wziewnie (INH)
- Miejscowo (TOP)

Nie wolno pokazywać wszystkich możliwych dróg globalnie. Lista musi wynikać z danych konkretnego preparatu.

Jeśli preparat ma tylko jedną drogę podania, ekran jest pomijany.

## 5. Wybór typu obliczenia
Aplikacja pokazuje tylko obliczenia sensowne dla wybranego preparatu, drogi podania i dostępnych danych.

Przykłady:

Dla preparatu dożylnego:
- dawka → ml,
- ml/h,
- krople/min,
- ile ampułek.

Dla leku zależnego od masy:
- mg/kg → mg,
- mg/kg → ml.

Dla insuliny:
- j.m. → ml.

Dla preparatu doustnego:
- liczba tabletek,
- dawka dobowa,
- podział dawki.

Jeśli dostępny jest tylko jeden typ obliczenia, wybierz go automatycznie.

## 6. Parametry obliczenia
Aplikacja pokazuje tylko pola wymagane dla wybranego obliczenia.

Przykłady:

### dawka → ml
- dawka zlecona,
- stężenie, jeśli nie wynika jednoznacznie z preparatu.

### mg/kg → mg
- dawka na kg,
- masa ciała.

### mg/kg → ml
- dawka na kg,
- masa ciała,
- stężenie, jeśli potrzebne.

### ml/h
- objętość,
- czas.

### krople/min
- objętość,
- czas,
- liczba kropli/ml.

Do wprowadzania liczb użyj komponentu DigitWheelPicker.

## 7. Wynik
Ekran wyniku pokazuje:
- duży wynik główny,
- jednostkę,
- podsumowanie wybranych danych,
- rozwijaną sekcję „Pokaż obliczenia”,
- ostrzeżenie dla leków highRisk,
- komunikat bezpieczeństwa.

Przykład:

```text
Pobrać: 4 ml

Lek: przykładowy
Droga: Dożylnie (IV)
Dawka: 500 mg
Stężenie: 250 mg / 2 ml

Pokaż obliczenia
```
