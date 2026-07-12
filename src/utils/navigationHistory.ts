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
    document.querySelector<HTMLElement>(".selectionPage")?.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  resetScroll();
  window.requestAnimationFrame(() => {
    resetScroll();
    window.requestAnimationFrame(resetScroll);
  });

  const viewport = window.visualViewport;
  const handleViewportChange = (): void => {
    window.requestAnimationFrame(resetScroll);
  };

  viewport?.addEventListener("resize", handleViewportChange, { passive: true });
  viewport?.addEventListener("scroll", handleViewportChange, { passive: true });

  // W trybie standalone iOS potrafi przywrócić przesunięcie dopiero po
  // zakończeniu animacji klawiatury i rozszerzeniu visual viewport.
  [100, 300, 600, 900, 1200].forEach((delay) => window.setTimeout(resetScroll, delay));

  window.setTimeout(() => {
    viewport?.removeEventListener("resize", handleViewportChange);
    viewport?.removeEventListener("scroll", handleViewportChange);
  }, 1250);
}
