import { useEffect, useLayoutEffect, useState } from "react";
import { DrugSearch } from "./components/DrugSearch";
import { ProductSelector } from "./components/ProductSelector";
import { drugRepository } from "./services/DrugRepository";
import type { Drug } from "./types";
import {
  getNavigationState,
  pushNavigationState,
  replaceNavigationState,
  scrollToTopAfterNavigation
} from "./utils/navigationHistory";

function findDrug(drugId: string | undefined): Drug | null {
  if (!drugId) {
    return null;
  }

  return drugRepository.getAllDrugs().find((drug) => drug.id === drugId) ?? null;
}

function getInitialDrug(): Drug | null {
  const navigation = getNavigationState();
  return navigation?.level === "drug" || navigation?.level === "product"
    ? findDrug(navigation.drugId)
    : null;
}

export function App() {
  const [query, setQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(getInitialDrug);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!getNavigationState()) {
      replaceNavigationState({ level: "search" });
    }

    function handlePopState(event: PopStateEvent): void {
      const navigation = getNavigationState(event.state);

      if (navigation?.level === "drug" || navigation?.level === "product") {
        setSelectedDrug(findDrug(navigation.drugId));
      } else {
        setSelectedDrug(null);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useLayoutEffect(() => {
    const selectionModeActive = selectedDrug !== null;
    const searchPageActive = !selectionModeActive;
    document.documentElement.classList.toggle("selectionModeActive", selectionModeActive);
    document.body.classList.toggle("selectionModeActive", selectionModeActive);
    document.documentElement.classList.toggle("searchPageActive", searchPageActive);
    document.body.classList.toggle("searchPageActive", searchPageActive);

    scrollToTopAfterNavigation();

    if (searchPageActive) {
      document.querySelector<HTMLElement>(".searchResultsArea")?.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });
    }

    return () => {
      if (selectionModeActive) {
        document.documentElement.classList.remove("selectionModeActive");
        document.body.classList.remove("selectionModeActive");
      }

      if (searchPageActive) {
        document.documentElement.classList.remove("searchPageActive");
        document.body.classList.remove("searchPageActive");
      }
    };
  }, [selectedDrug]);

  useEffect(() => {
    if (selectedDrug !== null) {
      return;
    }

    let resetFrame = 0;

    function keepSearchViewportFixed(): void {
      if (window.scrollX === 0 && window.scrollY === 0) {
        return;
      }

      window.cancelAnimationFrame(resetFrame);
      resetFrame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }

    window.addEventListener("scroll", keepSearchViewportFixed, { passive: true });
    window.visualViewport?.addEventListener("scroll", keepSearchViewportFixed, { passive: true });

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.removeEventListener("scroll", keepSearchViewportFixed);
      window.visualViewport?.removeEventListener("scroll", keepSearchViewportFixed);
    };
  }, [selectedDrug]);

  function selectDrug(drug: Drug, matchedTradeName?: string): void {
    if (matchedTradeName) {
      pushNavigationState({
        level: "product",
        drugId: drug.id,
        tradeName: matchedTradeName
      });
    } else {
      pushNavigationState({ level: "drug", drugId: drug.id });
    }

    setSelectedDrug(drug);
  }

  function goBack(): void {
    const navigation = getNavigationState();

    if (navigation?.level === "drug" || navigation?.level === "product") {
      window.history.back();
    } else {
      setSelectedDrug(null);
    }
  }

  return (
    <main className={`pageShell minimalSearchPage${selectedDrug ? " selectionPage" : ""}`}>
      {selectedDrug ? (
        <>
          <nav className="minimalTopBar" aria-label="Nawigacja">
            <button type="button" className="backLink" onClick={goBack}>
              <span aria-hidden="true">←</span> Wróć
            </button>
          </nav>
          <ProductSelector
            products={selectedDrug.products}
            activeSubstance={selectedDrug.activeSubstance}
            useBrowserHistory
          />
        </>
      ) : (
        <DrugSearch query={query} onQueryChange={setQuery} onSelect={selectDrug} />
      )}
    </main>
  );
}
