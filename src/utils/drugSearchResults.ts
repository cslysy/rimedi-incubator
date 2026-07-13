import type { Drug } from "../types";
import { containsNormalized, normalizeSearchText } from "./search";

export interface DrugSearchResult {
  drug: Drug;
  matchedTradeName?: string;
  substituteCount: number;
}

function getResultLabel(result: DrugSearchResult): string {
  return result.matchedTradeName ?? result.drug.activeSubstance ?? result.drug.name;
}

function getMatchRank(result: DrugSearchResult, query: string): number {
  const normalizedLabel = normalizeSearchText(getResultLabel(result));
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedLabel === normalizedQuery) {
    return 0;
  }

  if (normalizedLabel.startsWith(normalizedQuery)) {
    return 1;
  }

  const startsAtWordBoundary = normalizedLabel
    .split(/[^a-z0-9]+/u)
    .some((word) => word.startsWith(normalizedQuery));

  return startsAtWordBoundary ? 2 : 3;
}

function getUniqueTradeNames(drug: Drug): string[] {
  const names = new Map<string, string>();

  for (const product of drug.products) {
    const key = normalizeSearchText(product.tradeName);

    if (!names.has(key)) {
      names.set(key, product.tradeName);
    }
  }

  return [...names.values()].sort((left, right) => left.localeCompare(right, "pl-PL"));
}

export function buildDrugSearchResults(drugs: Drug[], query: string): DrugSearchResult[] {
  const results = drugs.flatMap((drug) => {
    const tradeNames = getUniqueTradeNames(drug);
    const substanceMatched =
      containsNormalized(drug.activeSubstance, query) || containsNormalized(drug.name, query);

    if (substanceMatched) {
      return [{ drug, substituteCount: tradeNames.length }];
    }

    const matchingTradeNames = tradeNames.filter((tradeName) => containsNormalized(tradeName, query));

    if (matchingTradeNames.length === 0) {
      return [{ drug, substituteCount: tradeNames.length }];
    }

    return matchingTradeNames.map((matchedTradeName) => ({
      drug,
      matchedTradeName,
      substituteCount: Math.max(0, tradeNames.length - 1)
    }));
  });

  return results.sort((left, right) => {
    const rankDifference = getMatchRank(left, query) - getMatchRank(right, query);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return getResultLabel(left).localeCompare(getResultLabel(right), "pl-PL");
  });
}

export function formatSubstituteCount(count: number): string {
  if (count === 1) {
    return "1 dostępny zamiennik";
  }

  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${count} dostępne zamienniki`;
  }

  return `${count} dostępnych zamienników`;
}
