import type { DrugProduct } from "./DrugProduct";

export interface Drug {
  id: string;
  name: string;
  activeSubstance: string;
  products: DrugProduct[];
}

export interface DrugCatalog {
  drugs: Drug[];
}
