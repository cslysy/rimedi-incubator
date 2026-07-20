import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { drugRepository } from "../services/DrugRepository";
import type { Drug } from "../types";
import { buildDrugSearchResults, formatSubstituteCount } from "../utils/drugSearchResults";

interface DrugSearchProps {
  query?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (drug: Drug, matchedTradeName?: string) => void;
  catalogStatus?: "checking" | "loading" | "ready" | "error";
  onRetryCatalog?: () => void;
}

const MAX_VISIBLE_RESULTS = 50;

export function DrugSearch({
  query,
  onQueryChange,
  onSelect,
  catalogStatus = "ready",
  onRetryCatalog
}: DrugSearchProps = {}) {
  const [internalQuery, setInternalQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuery = query ?? internalQuery;
  const trimmedQuery = currentQuery.trim();
  const results = useMemo(
    () => (catalogStatus === "ready" ? drugRepository.searchDrugs(currentQuery) : []),
    [catalogStatus, currentQuery]
  );
  const searchResults = useMemo(
    () => buildDrugSearchResults(results, currentQuery),
    [currentQuery, results]
  );
  const visibleResults = searchResults.slice(0, MAX_VISIBLE_RESULTS);
  const isSearching = catalogStatus === "ready" && trimmedQuery.length > 0;
  const hasSearchQuery = trimmedQuery.length >= 2;

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("searchModeActive", isSearching);
    document.body.classList.toggle("searchModeActive", isSearching);

    return () => {
      document.documentElement.classList.remove("searchModeActive");
      document.body.classList.remove("searchModeActive");
    };
  }, [isSearching]);

  function updateQuery(nextQuery: string): void {
    if (onQueryChange) {
      onQueryChange(nextQuery);
    } else {
      setInternalQuery(nextQuery);
    }
  }

  function clearQuery(): void {
    updateQuery("");
    inputRef.current?.focus();
  }

  return (
    <section
      className={`mobileSearchExperience${isSearching ? " searchActive" : ""}`}
      aria-labelledby="drug-search-title"
    >
      <div className="searchControls">
        <div className="searchBrand">
          <h1 id="drug-search-title">Rimedi</h1>
          <p className="searchTagline">Leki bez tajemnic</p>
        </div>
        {catalogStatus !== "loading" && (
          <>
            <label className="visuallyHidden" htmlFor="drug-search">
              Nazwa handlowa lub substancja czynna
            </label>
            <div className="searchInputWrap catalogSearchReady">
              <svg className="searchIcon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
              </svg>
              <input
                ref={inputRef}
                id="drug-search"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                className="minimalSearchInput"
                value={currentQuery}
                minLength={2}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Lek lub substancja czynna"
                aria-describedby="search-feedback"
                onChange={(event) => updateQuery(event.target.value)}
              />
              {currentQuery.length > 0 && (
                <button
                  type="button"
                  className="clearSearchButton"
                  aria-label="Wyczyść wyszukiwanie"
                  onClick={clearQuery}
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="searchResultsArea">
        <div id="search-feedback" className="minimalSearchFeedback" aria-live="polite">
          {catalogStatus === "loading" && (
            <div className="catalogLoading" role="status" aria-label="Ładowanie bazy leków">
              <span className="catalogLoadingDots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <p>Ładowanie bazy leków</p>
            </div>
          )}
          {catalogStatus === "error" && (
            <div className="catalogLoadError">
              <p>Nie udało się załadować bazy leków.</p>
              {onRetryCatalog && (
                <button type="button" onClick={onRetryCatalog}>
                  Spróbuj ponownie
                </button>
              )}
            </div>
          )}
          {catalogStatus === "ready" && trimmedQuery.length === 1 && (
            <p>Wpisz jeszcze jeden znak</p>
          )}
          {catalogStatus === "ready" && hasSearchQuery && results.length === 0 && (
            <p>Brak wyników</p>
          )}
        </div>

        {visibleResults.length > 0 && (
          <div className="minimalResultList" aria-label="Wyniki wyszukiwania">
            {visibleResults.map((result) =>
              onSelect ? (
                <button
                  key={`${result.drug.id}:${result.matchedTradeName ?? "substance"}`}
                  type="button"
                  className={`minimalResultButton${result.matchedTradeName ? " tradeNameSearchResult" : ""}`}
                  onClick={() => {
                    inputRef.current?.blur();
                    onSelect(result.drug, result.matchedTradeName);
                  }}
                >
                  {result.matchedTradeName ? (
                    <>
                      <strong>{result.matchedTradeName}</strong>
                      <span className="matchedDrugName">
                        ({result.drug.activeSubstance === "-" ? "Brak danych o substancji" : result.drug.activeSubstance})
                      </span>
                      <span className="substituteCount">
                        {formatSubstituteCount(result.substituteCount)}
                      </span>
                    </>
                  ) : (
                    result.drug.activeSubstance === "-" ? "Brak danych o substancji" : result.drug.activeSubstance
                  )}
                </button>
              ) : (
                <article
                  key={`${result.drug.id}:${result.matchedTradeName ?? "substance"}`}
                  className="minimalResultItem"
                >
                  <strong>{result.matchedTradeName ?? result.drug.name}</strong>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
