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

Wersja publikowana na GitHub Pages wymaga połączenia z serwerem i przy każdym
uruchomieniu pobiera `public/availability.json` bez używania cache.

- `"enabled": true` udostępnia wyszukiwarkę.
- `"enabled": false` wyświetla informację o zakończeniu testów.
- Brak połączenia lub wyłączenie GitHub Pages również blokuje wyszukiwarkę.

Przed wyłączeniem Pages najpierw opublikuj `"enabled": false`, aby aktywne kopie
otrzymały komunikat o zakończeniu testów.

Przyszłą wersję App Store należy budować z:

```sh
VITE_DISTRIBUTION=app-store pnpm build
```

Taki build pomija sprawdzanie `availability.json`.
