# Deployment na GitHub Pages

Projekt jest skonfigurowany do publikacji spod ścieżki repozytorium, np.
`https://uzytkownik.github.io/rimedi/`.

1. Umieść projekt w repozytorium GitHub i wypchnij gałąź `main` lub `master`.
2. W ustawieniach repozytorium otwórz **Settings → Pages**.
3. W sekcji **Build and deployment** ustaw **Source** na **GitHub Actions**.
4. Workflow `Deploy Rimedi to GitHub Pages` przetestuje, zbuduje i opublikuje aplikację.

Wdrożenie można też uruchomić ręcznie z zakładki **Actions** przez
`Run workflow`.
