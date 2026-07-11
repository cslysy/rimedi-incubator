import type { AdministrationRouteCode } from "./Route";
import type { CalculatorType } from "./CalculatorType";

export interface RecentCalculation {
  id: string;
  productId: string;
  productName: string;
  routeCode?: AdministrationRouteCode;
  routeDisplay?: string;
  calculator: CalculatorType;
  calculatorLabel: string;
  resultValue: number;
  resultUnit: string;
  usedAt: string;
}

export interface FavoriteProduct {
  productId: string;
  productName: string;
  activeSubstance: string;
  concentrationText: string;
  addedAt: string;
}

export interface LocalUserData {
  recent: RecentCalculation[];
  favorites: FavoriteProduct[];
}
