import { useEffect, useState } from "react";
import { CalculatorSelector } from "../components/CalculatorSelector";
import { DrugSearch } from "../components/DrugSearch";
import { FlowSummary } from "../components/FlowSummary";
import { ParameterForm } from "../components/ParameterForm";
import { ProductSelector } from "../components/ProductSelector";
import { ResultPanel } from "../components/ResultPanel";
import { RouteSelector } from "../components/RouteSelector";
import { drugRepository } from "../services/DrugRepository";
import type {
  AdministrationRoute,
  AdministrationRouteCode,
  CalculatorDefinition,
  CalculatorType,
  Drug,
  DrugProduct,
  FavoriteProduct,
  RecentCalculation
} from "../types";
import type { CalculationResult } from "../utils/calculations";

interface InitialFlowSelection {
  productId?: string;
  routeCode?: AdministrationRouteCode;
  calculator?: CalculatorType;
}

interface DrugFlowPageProps {
  initialSelection?: InitialFlowSelection;
  favorites: FavoriteProduct[];
  onBackHome: () => void;
  onAddRecent: (calculation: RecentCalculation) => void;
  onToggleFavorite: (product: FavoriteProduct) => void;
}

function findDrugForProduct(product: DrugProduct): Drug | undefined {
  return drugRepository.getAllDrugs().find((drug) => drug.id === product.drugId);
}

function createRecentCalculation(
  product: DrugProduct,
  route: AdministrationRouteCode | undefined,
  calculator: CalculatorType,
  result: CalculationResult
): RecentCalculation {
  const routeDisplay = route ? drugRepository.getRouteDefinition(route)?.display : undefined;
  const calculatorLabel = drugRepository.getCalculatorDefinition(calculator)?.label ?? calculator;

  return {
    id: `${product.id}:${route ?? "NO_ROUTE"}:${calculator}`,
    productId: product.id,
    productName: product.tradeName,
    routeCode: route,
    routeDisplay,
    calculator,
    calculatorLabel,
    resultValue: result.value,
    resultUnit: result.unit,
    usedAt: new Date().toISOString()
  };
}

export function DrugFlowPage({
  initialSelection,
  favorites,
  onBackHome,
  onAddRecent,
  onToggleFavorite
}: DrugFlowPageProps) {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DrugProduct | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<AdministrationRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<AdministrationRouteCode | undefined>();
  const [availableCalculators, setAvailableCalculators] = useState<CalculatorDefinition[]>([]);
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  function resetFlow(): void {
    setSelectedDrug(null);
    setSelectedProduct(null);
    setAvailableRoutes([]);
    setSelectedRoute(undefined);
    setAvailableCalculators([]);
    setSelectedCalculator(null);
    setResult(null);
  }

  function clearProductSelection(): void {
    setSelectedProduct(null);
    setAvailableRoutes([]);
    setSelectedRoute(undefined);
    setAvailableCalculators([]);
    setSelectedCalculator(null);
    setResult(null);
  }

  function goBack(): void {
    if (result) {
      setResult(null);
      return;
    }

    if (selectedCalculator) {
      setSelectedCalculator(null);

      if (availableCalculators.length > 1) {
        return;
      }
    }

    if (selectedRoute) {
      setSelectedRoute(undefined);
      setAvailableCalculators([]);

      if (availableRoutes.length > 1) {
        return;
      }
    }

    if (selectedProduct) {
      clearProductSelection();

      if (products.length > 1) {
        return;
      }
    }

    if (selectedDrug) {
      resetFlow();
      return;
    }

    onBackHome();
  }

  function chooseDrug(drug: Drug): void {
    setSelectedDrug(drug);
    const products = drugRepository.getProductsForDrug(drug.id);

    if (products.length === 1) {
      chooseProduct(products[0]);
    }
  }

  function chooseProduct(
    product: DrugProduct,
    preferredRoute?: AdministrationRouteCode,
    preferredCalculator?: CalculatorType
  ): void {
    setSelectedProduct(product);
    const routes = drugRepository.getRoutesForProduct(product);
    setAvailableRoutes(routes);

    const routeToUse = preferredRoute && product.routes.includes(preferredRoute) ? preferredRoute : undefined;

    if (routeToUse) {
      chooseRoute(product, routeToUse, preferredCalculator);
    } else if (routes.length === 1) {
      chooseRoute(product, routes[0].code, preferredCalculator);
    } else if (routes.length === 0) {
      chooseCalculator(product, undefined, preferredCalculator);
    }
  }

  function chooseCalculator(
    product: DrugProduct,
    routeCode?: AdministrationRouteCode,
    preferredCalculator?: CalculatorType
  ): void {
    const calculators = drugRepository.getCalculatorsForProduct(product, routeCode);
    setAvailableCalculators(calculators);
    const calculatorToUse = calculators.find((calculator) => calculator.code === preferredCalculator);

    if (calculatorToUse) {
      setSelectedCalculator(calculatorToUse.code);
    } else if (calculators.length === 1) {
      setSelectedCalculator(calculators[0].code);
    }
  }

  function chooseRoute(
    product: DrugProduct,
    routeCode: AdministrationRouteCode,
    preferredCalculator?: CalculatorType
  ): void {
    setSelectedRoute(routeCode);
    chooseCalculator(product, routeCode, preferredCalculator);
  }

  function selectRoute(routeCode: AdministrationRouteCode): void {
    if (selectedProduct) {
      chooseRoute(selectedProduct, routeCode);
    }
  }

  const products = selectedDrug ? drugRepository.getProductsForDrug(selectedDrug.id) : [];
  const isSelectedProductFavorite = selectedProduct
    ? favorites.some((favorite) => favorite.productId === selectedProduct.id)
    : false;
  const selectedRouteDisplay = selectedRoute
    ? drugRepository.getRouteDefinition(selectedRoute)?.display ?? selectedRoute
    : "";
  const selectedCalculatorLabel = selectedCalculator
    ? drugRepository.getCalculatorDefinition(selectedCalculator)?.label ?? selectedCalculator
    : "";

  function handleResult(nextResult: CalculationResult): void {
    if (!selectedProduct || !selectedCalculator) {
      return;
    }

    setResult(nextResult);
    onAddRecent(createRecentCalculation(selectedProduct, selectedRoute, selectedCalculator, nextResult));
  }

  function handleToggleFavorite(): void {
    if (!selectedProduct) {
      return;
    }

    onToggleFavorite({
      productId: selectedProduct.id,
      productName: selectedProduct.tradeName,
      activeSubstance: selectedProduct.activeSubstance,
      concentrationText: selectedProduct.concentrationText,
      addedAt: new Date().toISOString()
    });
  }

  useEffect(() => {
    if (!initialSelection?.productId) {
      return;
    }

    const product = drugRepository.getProductById(initialSelection.productId);
    const drug = product ? findDrugForProduct(product) : undefined;

    if (!product || !drug) {
      return;
    }

    setSelectedDrug(drug);
    chooseProduct(product, initialSelection.routeCode, initialSelection.calculator);
  }, [initialSelection]);

  return (
    <main className="pageShell">
      <div className="topBar">
        <button type="button" className="ghostButton" onClick={goBack}>
          Wstecz
        </button>
        <span>Rimedi</span>
      </div>

      <FlowSummary
        items={[
          { label: "Lek", value: selectedDrug?.name ?? "" },
          { label: "Preparat", value: selectedProduct?.tradeName ?? "" },
          { label: "Droga", value: selectedRouteDisplay },
          { label: "Obliczenie", value: selectedCalculatorLabel }
        ]}
      />

      {!selectedDrug && <DrugSearch onSelect={chooseDrug} />}

      {selectedDrug && !selectedProduct && <ProductSelector products={products} onSelect={chooseProduct} />}

      {selectedProduct && availableRoutes.length > 1 && !selectedRoute && (
        <RouteSelector routes={availableRoutes} onSelect={selectRoute} />
      )}

      {selectedProduct &&
        (selectedRoute || availableRoutes.length === 0) &&
        !selectedCalculator &&
        availableCalculators.length > 1 && (
        <CalculatorSelector calculators={availableCalculators} onSelect={setSelectedCalculator} />
      )}

      {selectedProduct && selectedCalculator && !result && (
        <ParameterForm product={selectedProduct} calculator={selectedCalculator} onResult={handleResult} />
      )}

      {selectedProduct && selectedCalculator && result && (
        <ResultPanel
          product={selectedProduct}
          route={selectedRoute}
          routeDisplay={selectedRouteDisplay}
          calculatorLabel={selectedCalculatorLabel}
          calculator={selectedCalculator}
          result={result}
          isFavorite={isSelectedProductFavorite}
          onToggleFavorite={handleToggleFavorite}
          onEditInputs={() => setResult(null)}
          onRestart={resetFlow}
        />
      )}
    </main>
  );
}
