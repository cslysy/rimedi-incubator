import { useEffect, useMemo, useState } from "react";
import type { DrugProduct } from "../types";
import {
  getNavigationState,
  pushNavigationState,
  scrollToTopAfterNavigation
} from "../utils/navigationHistory";

interface ProductSelectorProps {
  products: DrugProduct[];
  onSelect?: (product: DrugProduct) => void;
  useBrowserHistory?: boolean;
}

export interface ProductNameGroup {
  tradeName: string;
  products: DrugProduct[];
}

export interface ProductVariantGroup {
  concentrationText: string;
  form: string;
  representative: DrugProduct;
  products: DrugProduct[];
}

function normalizeVariantPart(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
}

export function groupProductsByTradeName(products: DrugProduct[]): ProductNameGroup[] {
  const groups = new Map<string, ProductNameGroup>();

  for (const product of products) {
    const existingGroup = groups.get(product.tradeName);

    if (existingGroup) {
      existingGroup.products.push(product);
    } else {
      groups.set(product.tradeName, {
        tradeName: product.tradeName,
        products: [product]
      });
    }
  }

  return [...groups.values()].sort((left, right) =>
    left.tradeName.localeCompare(right.tradeName, "pl-PL")
  );
}

export function groupProductsByVariant(products: DrugProduct[]): ProductVariantGroup[] {
  const groups = new Map<string, ProductVariantGroup>();

  for (const product of products) {
    const key = `${normalizeVariantPart(product.concentrationText)}::${normalizeVariantPart(product.form)}`;
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.products.push(product);
    } else {
      groups.set(key, {
        concentrationText: product.concentrationText,
        form: product.form,
        representative: product,
        products: [product]
      });
    }
  }

  return [...groups.values()];
}

export function ProductSelector({ products, onSelect, useBrowserHistory = false }: ProductSelectorProps) {
  const [selectedTradeName, setSelectedTradeName] = useState<string | null>(() => {
    const navigation = useBrowserHistory ? getNavigationState() : undefined;
    return navigation?.level === "product" ? navigation.tradeName : null;
  });
  const productGroups = useMemo(() => groupProductsByTradeName(products), [products]);
  const selectedGroup = productGroups.find((group) => group.tradeName === selectedTradeName);
  const selectedVariants = useMemo(
    () => (selectedGroup ? groupProductsByVariant(selectedGroup.products) : []),
    [selectedGroup]
  );

  useEffect(() => {
    if (!useBrowserHistory) {
      setSelectedTradeName(null);
      return;
    }

    function syncWithHistory(state: unknown = window.history.state): void {
      const navigation = getNavigationState(state);
      const tradeName =
        navigation?.level === "product" &&
        products.some(
          (product) => product.drugId === navigation.drugId && product.tradeName === navigation.tradeName
        )
          ? navigation.tradeName
          : null;

      setSelectedTradeName(tradeName);
    }

    function handlePopState(event: PopStateEvent): void {
      syncWithHistory(event.state);
    }

    syncWithHistory();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products, useBrowserHistory]);

  function selectTradeName(group: ProductNameGroup): void {
    setSelectedTradeName(group.tradeName);

    if (useBrowserHistory && group.products[0]) {
      pushNavigationState({
        level: "product",
        drugId: group.products[0].drugId,
        tradeName: group.tradeName
      });
      scrollToTopAfterNavigation();
    }
  }

  if (selectedGroup) {
    return (
      <section className="minimalSelection" aria-labelledby="product-dose-selector-title">
        <h2 id="product-dose-selector-title">{selectedGroup.tradeName}</h2>
        <div className="minimalResultList variantList">
          {selectedVariants.map((variant) => {
            const product = variant.representative;
            const content = (
              <>
                <strong>{variant.concentrationText || "Brak danych o mocy"}</strong>
                <span>{variant.form}</span>
              </>
            );

            return onSelect ? (
              <button
                key={product.id}
                type="button"
                className="minimalVariant"
                onClick={() => onSelect(product)}
              >
                {content}
              </button>
            ) : (
              <article key={product.id} className="minimalVariant">
                {content}
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="minimalSelection" aria-labelledby="product-selector-title">
      <h2 id="product-selector-title">Nazwy handlowe</h2>
      <div className="minimalResultList tradeNameList">
        {productGroups.map((group) => (
          <button
            key={group.tradeName}
            type="button"
            className="minimalResultButton"
            onClick={() => selectTradeName(group)}
          >
            {group.tradeName}
          </button>
        ))}
      </div>
    </section>
  );
}
