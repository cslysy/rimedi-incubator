export type RimediNavigationState =
  | { level: "search" }
  | { level: "drug"; drugId: string }
  | { level: "product"; drugId: string; tradeName: string };

interface BrowserHistoryState {
  rimediNavigation?: RimediNavigationState;
}

export function getNavigationState(state: unknown = window.history.state): RimediNavigationState | undefined {
  if (!state || typeof state !== "object") {
    return undefined;
  }

  const navigation = (state as BrowserHistoryState).rimediNavigation;

  if (!navigation || !["search", "drug", "product"].includes(navigation.level)) {
    return undefined;
  }

  return navigation;
}

export function replaceNavigationState(navigation: RimediNavigationState): void {
  window.history.replaceState({ ...window.history.state, rimediNavigation: navigation }, "");
}

export function pushNavigationState(navigation: RimediNavigationState): void {
  window.history.pushState({ ...window.history.state, rimediNavigation: navigation }, "");
}

export function scrollToTopAfterNavigation(): void {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }

  function resetScroll(): void {
    const scrollingElement = document.scrollingElement;

    if (scrollingElement) {
      scrollingElement.scrollTop = 0;
      scrollingElement.scrollLeft = 0;
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  resetScroll();
  window.requestAnimationFrame(() => {
    resetScroll();
    window.requestAnimationFrame(resetScroll);
  });

  // Safari przywraca przesunięcie strony dopiero po schowaniu klawiatury
  // i ponownym rozszerzeniu visual viewport.
  [100, 300, 600].forEach((delay) => window.setTimeout(resetScroll, delay));
}
