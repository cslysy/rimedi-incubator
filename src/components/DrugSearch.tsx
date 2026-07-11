import { useEffect, useMemo, useRef, useState } from "react";
import { drugRepository } from "../services/DrugRepository";
import type { Drug } from "../types";

interface DrugSearchProps {
  query?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (drug: Drug) => void;
}

const MAX_VISIBLE_RESULTS = 50;

export function DrugSearch({ query, onQueryChange, onSelect }: DrugSearchProps = {}) {
  const [internalQuery, setInternalQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuery = query ?? internalQuery;
  const trimmedQuery = currentQuery.trim();
  const results = useMemo(() => drugRepository.searchDrugs(currentQuery), [currentQuery]);
  const visibleResults = results.slice(0, MAX_VISIBLE_RESULTS);
  const isSearching = trimmedQuery.length > 0;
  const hasSearchQuery = trimmedQuery.length >= 2;

  useEffect(() => {
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
        <h1 id="drug-search-title">Rimedi</h1>
        <label className="visuallyHidden" htmlFor="drug-search">
          Nazwa handlowa lub substancja czynna
        </label>
        <div className="searchInputWrap">
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
            <button type="button" className="clearSearchButton" aria-label="Wyczyść wyszukiwanie" onClick={clearQuery}>
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      </div>

      <div className="searchResultsArea">
        <div id="search-feedback" className="minimalSearchFeedback" aria-live="polite">
          {trimmedQuery.length === 1 && <p>Wpisz jeszcze jeden znak</p>}
          {hasSearchQuery && results.length === 0 && <p>Brak wyników</p>}
        </div>

        {visibleResults.length > 0 && (
          <div className="minimalResultList" aria-label="Wyniki wyszukiwania">
            {visibleResults.map((drug) =>
              onSelect ? (
                <button
                  key={drug.id}
                  type="button"
                  className="minimalResultButton"
                  onClick={() => onSelect(drug)}
                >
                  {drug.activeSubstance === "-" ? "Brak danych o substancji" : drug.activeSubstance}
                </button>
              ) : (
                <article key={drug.id} className="minimalResultItem">
                  <strong>{drug.name}</strong>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
