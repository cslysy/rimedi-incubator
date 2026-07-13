import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { DrugProduct } from "../types";
import {
  getNavigationState,
  pushNavigationState,
  scrollToTopAfterNavigation
} from "../utils/navigationHistory";

interface ProductSelectorProps {
  products: DrugProduct[];
  activeSubstance?: string;
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

export interface ProductFormGroup {
  form: string;
  variants: ProductVariantGroup[];
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

export function groupVariantsByForm(variants: ProductVariantGroup[]): ProductFormGroup[] {
  const groups = new Map<string, ProductFormGroup>();

  for (const variant of variants) {
    const key = normalizeVariantPart(variant.form);
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.variants.push(variant);
    } else {
      groups.set(key, { form: variant.form, variants: [variant] });
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      variants: [...group.variants].sort((left, right) => {
        const leftStrength = left.representative.strengthValue;
        const rightStrength = right.representative.strengthValue;

        if (leftStrength !== undefined && rightStrength !== undefined && leftStrength !== rightStrength) {
          return leftStrength - rightStrength;
        }

        return left.concentrationText.localeCompare(right.concentrationText, "pl-PL", { numeric: true });
      })
    }))
    .sort((left, right) => left.form.localeCompare(right.form, "pl-PL"));
}

export function arePotentialSubstitutes(
  selectedProducts: DrugProduct[],
  candidateProducts: DrugProduct[]
): boolean {
  return selectedProducts.some((selectedProduct) =>
    candidateProducts.some(
      (candidateProduct) =>
        normalizeVariantPart(selectedProduct.form) === normalizeVariantPart(candidateProduct.form)
    )
  );
}

export function getProductFormLabels(products: DrugProduct[]): string[] {
  const forms = new Map<string, string>();

  for (const product of products) {
    const normalizedForm = normalizeVariantPart(product.form);

    if (normalizedForm && !forms.has(normalizedForm)) {
      forms.set(normalizedForm, product.form.trim());
    }
  }

  return [...forms.values()].sort((left, right) => left.localeCompare(right, "pl-PL"));
}

export function ProductSelector({
  products,
  activeSubstance,
  onSelect,
  useBrowserHistory = false
}: ProductSelectorProps) {
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
  const selectedFormGroups = useMemo(
    () => groupVariantsByForm(selectedVariants),
    [selectedVariants]
  );
  const displayedActiveSubstance =
    activeSubstance ?? selectedGroup?.products[0]?.activeSubstance ?? products[0]?.activeSubstance ?? "-";
  const otherProductGroups = selectedGroup
    ? productGroups.filter((group) => group.tradeName !== selectedGroup.tradeName)
    : [];
  const potentialSubstituteGroups = selectedGroup
    ? otherProductGroups.filter((group) =>
        arePotentialSubstitutes(selectedGroup.products, group.products)
      )
    : [];
  const sameSubstanceGroups = selectedGroup
    ? otherProductGroups.filter(
        (group) => !arePotentialSubstitutes(selectedGroup.products, group.products)
      )
    : [];

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

  useLayoutEffect(() => {
    if (selectedTradeName) {
      scrollToTopAfterNavigation();
    }
  }, [selectedTradeName]);

  function selectTradeName(group: ProductNameGroup): void {
    setSelectedTradeName(group.tradeName);

    if (useBrowserHistory && group.products[0]) {
      pushNavigationState({
        level: "product",
        drugId: group.products[0].drugId,
        tradeName: group.tradeName
      });
    }
  }

  if (selectedGroup) {
    return (
      <>
        <header className="productIdentity">
          <h1 className="substanceTitle productTradeTitle">{selectedGroup.tradeName}</h1>
          <p className="productSubstance">
            ({displayedActiveSubstance === "-" ? "Brak danych o substancji" : displayedActiveSubstance})
          </p>
        </header>

        <section className="minimalSelection" aria-labelledby="product-dose-selector-title">
          <h2 id="product-dose-selector-title">Dostępne dawki i postacie</h2>
          <div className="minimalResultList variantList">
            {selectedFormGroups.map((formGroup) => (
              <article key={formGroup.form} className="minimalVariant formVariantGroup">
                <strong>{formGroup.form}</strong>
                <div className="variantStrengths">
                  {formGroup.variants.map((variant) => {
                    const strength = variant.concentrationText || "Brak danych o mocy";

                    return onSelect ? (
                      <button
                        key={variant.representative.id}
                        type="button"
                        className="variantStrengthButton"
                        onClick={() => onSelect(variant.representative)}
                      >
                        {strength}
                      </button>
                    ) : (
                      <span key={variant.representative.id} className="variantStrength">
                        {strength}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="minimalSelection substituteSection" aria-labelledby="substitute-selector-title">
          <h2 id="substitute-selector-title">Potencjalne zamienniki</h2>
          {potentialSubstituteGroups.length > 0 ? (
            <div className="minimalResultList tradeNameList">
              {potentialSubstituteGroups.map((group) => (
                <button
                  key={group.tradeName}
                  type="button"
                  className="minimalResultButton detailedProductButton"
                  onClick={() => selectTradeName(group)}
                >
                  <span>{group.tradeName}</span>
                  {getProductFormLabels(group.products).length > 0 && (
                    <span className="productFormSummary">
                      {getProductFormLabels(group.products).join(" · ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="emptySubstitutes">Brak potencjalnych zamienników</p>
          )}
        </section>

        <section className="minimalSelection sameSubstanceSection" aria-labelledby="same-substance-title">
          <h2 id="same-substance-title">Inne leki z tą samą substancją czynną</h2>
          {sameSubstanceGroups.length > 0 ? (
            <div className="minimalResultList tradeNameList">
              {sameSubstanceGroups.map((group) => (
                <button
                  key={group.tradeName}
                  type="button"
                  className="minimalResultButton detailedProductButton"
                  onClick={() => selectTradeName(group)}
                >
                  <span>{group.tradeName}</span>
                  {getProductFormLabels(group.products).length > 0 && (
                    <span className="productFormSummary">
                      {getProductFormLabels(group.products).join(" · ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="emptySubstitutes">Brak innych leków</p>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <h1 className="substanceTitle">{displayedActiveSubstance}</h1>
      <section className="minimalSelection" aria-labelledby="product-selector-title">
        <h2 id="product-selector-title">Nazwy handlowe</h2>
        <div className="minimalResultList tradeNameList">
          {productGroups.map((group) => (
            <button
              key={group.tradeName}
              type="button"
              className="minimalResultButton detailedProductButton"
              onClick={() => selectTradeName(group)}
            >
              <span>{group.tradeName}</span>
              {getProductFormLabels(group.products).length > 0 && (
                <span className="productFormSummary">
                  {getProductFormLabels(group.products).join(" · ")}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
