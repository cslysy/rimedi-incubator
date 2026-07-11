# Deployment na GitHub Pages

Projekt jest skonfigurowany do publikacji spod ścieżki repozytorium, np.
`https://uzytkownik.github.io/rimedi/`.

1. Umieść projekt w repozytorium GitHub i wypchnij gałąź `main` lub `master`.
2. W ustawieniach repozytorium otwórz **Settings → Pages**.
3. W sekcji **Build and deployment** ustaw **Source** na **GitHub Actions**.
4. Workflow `Deploy Rimedi to GitHub Pages` przetestuje, zbuduje i opublikuje aplikację.

Wdrożenie można też uruchomić ręcznie z zakładki **Actions** przez
`Run workflow`.

## Dostępność wersji testowej

Pliki aplikacji są przechowywane w cache, dzięki czemu zainstalowana PWA może
uruchomić ekran statusu bez połączenia. Przy każdym uruchomieniu aplikacja pobiera
jednak `public/availability.json` bezpośrednio z sieci i nigdy nie zapisuje go w
cache.

- `"enabled": true` udostępnia wyszukiwarkę.
- `"enabled": false` wyświetla informację o zakończeniu testów.
- Brak połączenia lub wyłączenie GitHub Pages blokuje wyszukiwarkę i wyświetla
  komunikat o niedostępności aplikacji.

Przed wyłączeniem Pages najpierw opublikuj `"enabled": false`, aby aktywne kopie
otrzymały komunikat o zakończeniu testów.

Przyszłą wersję App Store należy budować z:

```sh
VITE_DISTRIBUTION=app-store pnpm build
```

Taki build pomija sprawdzanie `availability.json`.
