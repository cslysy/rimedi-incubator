import type { CalculatorType } from "./CalculatorType";
import type { AdministrationRouteCode } from "./Route";

export interface ProductMetadata {
  productId: string;
  calculators: CalculatorType[];
  routeCalculators?: Partial<Record<AdministrationRouteCode, CalculatorType[]>>;
  highRisk: boolean;
  sourceNote: string;
  updatedAt?: string;
}
