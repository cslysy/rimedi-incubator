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
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useLayoutEffect(() => {
    if (selectedDrug) {
      scrollToTopAfterNavigation();
    }
  }, [selectedDrug]);

  function selectDrug(drug: Drug): void {
    setSelectedDrug(drug);
    pushNavigationState({ level: "drug", drugId: drug.id });
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
          <h1 className="substanceTitle">{selectedDrug.activeSubstance}</h1>
          <ProductSelector products={selectedDrug.products} useBrowserHistory />
        </>
      ) : (
        <DrugSearch query={query} onQueryChange={setQuery} onSelect={selectDrug} />
      )}
    </main>
  );
}
