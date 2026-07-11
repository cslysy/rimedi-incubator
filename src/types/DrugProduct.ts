import type { CalculatorType } from "./CalculatorType";
import type { ProductIndication } from "./ProductIndication";
import type { AdministrationRouteCode } from "./Route";
import type { UnitCode } from "./Unit";

export interface DrugProduct {
  id: string;
  drugId: string;
  tradeName: string;
  activeSubstance: string;
  form: string;
  strengthValue?: number;
  strengthUnit?: UnitCode;
  concentrationText: string;
  concentrationPerMl?: number;
  concentrationUnit?: UnitCode;
  packageVolumeMl?: number;
  unitsPerMl?: number;
  manufacturer?: string;
  atcCode?: string;
  routes: AdministrationRouteCode[];
  calculators: CalculatorType[];
  highRisk: boolean;
  sourceNote: string;
  updatedAt?: string;
  therapeuticIndications?: ProductIndication;
}
