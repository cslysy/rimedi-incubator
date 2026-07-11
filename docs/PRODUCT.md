# PRODUCT.md

## Nazwa robocza
Ampułkomat / DoseFlow / nazwa do ustalenia.

## Cel produktu
Aplikacja PWA dla pielęgniarek i personelu medycznego, działająca całkowicie lokalnie, bez backendu i bez połączeń z internetem.

Aplikacja ma pomagać w technicznych przeliczeniach związanych z lekami, np. dawka → ml, mg/kg → mg, mg/kg → ml, j.m. → ml, ml/h, krople/min, liczba ampułek.

Aplikacja nie może sugerować dawkowania. Ma wyłącznie przeliczać wartości wpisane przez użytkownika lub wynikające z wybranego preparatu.

## Główne założenia
- PWA offline-first.
- Brak backendu.
- Brak logowania.
- Brak kont użytkowników.
- Brak zewnętrznych API.
- Brak requestów sieciowych.
- Wszystkie dane są lokalne.
- Dane leków pochodzą z lokalnych plików JSON/TypeScript.
- Aplikacja ma być mobile-first.
- Interfejs w języku polskim.
- Flow zaczyna się od wyboru leku, a nie od wyboru kalkulatora.
- Aplikacja ma zadawać jak najmniej pytań, jeśli dane wynikają z wybranego preparatu.

## Grupa docelowa
- Pielęgniarki.
- Oddziałowe.
- Personel medyczny potrzebujący szybkich przeliczeń pomocniczych.

## Wartość produktu
- Szybkie wyszukiwanie leku.
- Pokazywanie tylko dostępnych dróg podania.
- Pokazywanie tylko sensownych kalkulatorów dla danego preparatu.
- Bezpieczny, lokalny tryb pracy.
- Wygodne wprowadzanie liczb przez DigitWheelPicker.
- Możliwość późniejszego rozszerzenia o pełną bazę produktów leczniczych dostępnych w Polsce.

## Granice odpowiedzialności aplikacji
Aplikacja nie jest systemem decyzyjnym ani medycznym źródłem dawkowania. Nie zastępuje zlecenia lekarskiego, ChPL ani procedur placówki.

Na ekranie wyniku zawsze musi być komunikat:

> Aplikacja wykonuje wyłącznie obliczenia pomocnicze na podstawie danych wpisanych przez użytkownika. Nie zastępuje zlecenia lekarskiego ani procedur obowiązujących w placówce.
